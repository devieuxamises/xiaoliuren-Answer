export const ENGINE_VERSION = "2.2.2";
export const RULESET = "邵一尘讲义·三宫规则＋语境推演规范";
export const normalizeNumber = n => n === 0 ? 10 : Math.max(1, Number.isFinite(n) ? n : 1);
export const countPalace = (start, n) => (start + Math.max(1, n) - 1) % 6;
export function castThree(nums) {
  const values = nums.map(normalizeNumber);
  const heaven = countPalace(0, values[0]);
  const earth = countPalace(heaven, values[1]);
  const human = countPalace(earth, values[2]);
  return { v: values, cast: [heaven, earth, human] };
}
export function fiveElementRelation(a, b) {
  if (a === b) return ["比和", "两宫同气，力量集中，也容易固着"];
  const generates = { 木:"火", 火:"土", 土:"金", 金:"水", 水:"木" };
  const controls = { 木:"土", 土:"水", 水:"火", 火:"金", 金:"木" };
  if (generates[a] === b) return ["生", "前势推动后势，发展较顺"];
  if (generates[b] === a) return ["受生", "后势反哺前势，条件逐渐补足"];
  if (controls[a] === b) return ["克", "前势压制后势，推进有阻"];
  return ["受克", "后势反制前势，局面可能转向"];
}
export function branchIndex(date) {
  const hour = date.getHours();
  return hour === 23 ? 0 : Math.floor((hour + 1) / 2);
}
export const relationScore = relation => relation === "生" || relation === "受生" ? 1 : relation === "克" || relation === "受克" ? -1 : 0;
