"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobsNewSchema = require("../schemas/jobsNew.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
const jobsUpdateSchema = require("../schemas/jobsUpdate.json");
const { json } = require("body-parser");
// const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { job } => { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function(req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, jobsNewSchema);
        if (!validator.valid){
            const errs = validator.errors.map( e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        console.log(job);
        return res.status(201).json({ job })
    }catch (err) {
        return next(err);
    }
});


/** GET / =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */
router.get("/", async function(req, res, next) {

    const q = req.query;
    //arrive as strings from querystring and turn into int
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";
    try {
        const validator = jsonschema.validate(q, jobSearchSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const allJobs = await Job.findAll(q);
        return res.status(201).json({ allJobs })
    } catch (err) {
        return next(err)
    }
})


/** GET /[jobId] => { job }
 *
 * Returns { id, title, salary, equity, company }
 *   where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */
router.get("/:id", async function(req, res, next){
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch(err){
        return next(err);
    }
})


/** PATCH /[jobId]  { fld1, fld2, ... } => { job }
 *
 * Data can include: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, jobsUpdateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
})


/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */
router.delete("/:id", ensureAdmin, async function(req, res, next){
    try {
        await Job.remove(req.params.id);
        return res.json({DELETED: req.params.id})
    } catch(err){
        return next(err)
    }
})


module.exports = router;