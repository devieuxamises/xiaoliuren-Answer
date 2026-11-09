import test from "node:test";
import assert from "node:assert/strict";
import { branchIndex, castThree, fiveElementRelation } from "../app/engine.js";

test("all common three-number casts stay inside six palaces", () => {
  for (let a=0;a<=12;a++) for (let b=0;b<=12;b++) for (let c=0;c<=12;c++) {
    const result=castThree([a,b,c]);
    assert.equal(result.cast.length,3);
    result.cast.forEach(x=>assert.ok(x>=0 && x<6));
  }
});

test("all 24 hours map to the correct twelve branches", () => {
  const expected=[0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,0];
  expected.forEach((branch,hour)=>{ const d=new Date(2026,0,1,hour); assert.equal(branchIndex(d),branch); });
});

test("five-element relation covers generation, control and equality", () => {
  assert.equal(fiveElementRelation("木","火")[0],"生");
  assert.equal(fiveElementRelation("木","土")[0],"克");
  assert.equal(fiveElementRelation("水","水")[0],"比和");
  assert.equal(fiveElementRelation("土","木")[0],"受克");
});
