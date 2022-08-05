const { BadRequestError } = require("../expressError");


/*This function is used in Models folder with the User and Company Classes
* specifically to update partial information without requiring ALL fields 

* Takes data req.body and separates JSON key:value pairs. ("firstName":"Joel").

* Will then map Keys into an Array. "Cols" maps K:V pairs values into an array matching table columns.
* Values are sanitized for SQL by adding $1, $2, etc to each col (aka value)

* Lastly, returns setCols as column names to be updated by joining each, then values as Object.values with $'s for update

* Example:
*     keys = [ 'firstName', 'email' ]
      cols = [ '"first_name"=$1', '"email"=$2' ]
      return {
        setCols: '"first_name"=$1, "email"=$2',
        values: [ 'TIMOTHY', 'timkelley@gmail.com' ]
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  console.log("KEYS!!!", keys);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  console.log("COLS!!!", cols);
  console.log("RETURN STATEMENT!!!", {setCols: cols.join(", "),
              values: Object.values(dataToUpdate)})
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
