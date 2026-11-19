import Table from "cli-table";

export const table = new Table({
  head: ["Route", "Method", "Controller"],
  colors: true,
  colWidths: [55, 18, 70],
});
