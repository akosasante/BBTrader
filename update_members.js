const fs = require("fs");

if (process.argv.length < 5) {
  console.error('Expected at least 3 arguments!');
  process.exit(1);
} else {
  const json_members_path = process.argv[2];
  const save_path_server = process.argv[3];
  const save_path_client = process.argv[4];
  const json_members_string = fs.readFileSync(json_members_path, "utf8");
  const members_array = process_json_members(json_members_string);
  const cleaned_members = clean_members(members_array);
  const format_members_array = format_members(cleaned_members);
  const inverted_members_array = invert_members(format_members_array);
  const format_members_object = array_to_object(format_members_array);
  const inverted_members_object = array_to_object(inverted_members_array);
  const jsStringServer = members_js_string(format_members_object, inverted_members_object);
  const jsStringClient = members_store_string(cleaned_members);
  fs.writeFileSync(save_path_server, jsStringServer);
  fs.writeFileSync(save_path_client, jsStringClient);
}

function process_json_members(str) {
  return JSON.parse("[" + (str
    .trim()
    .split("\n")
    .join(","))
  + "]")
}

function clean_members(members) {
  const filtered = members.filter(player => !player.name.includes("Akosua") && !player.name.includes("Jatheesh"));
  return replaceCamJath(filtered)
}

function replaceCamJath(members) {
  return members.map(player =>
    player.name === "Cam MacInnis"
    ? {...player, name: "Cam and Jatheesh"}
    : player
  )
}

function format_members(members) {
  return members.map(player => ({[player._id.$oid]: player.name}))
}

function invert_members(members) {
  return members.reduce((inverted, player) => {
    const [id, name] = Object.entries(player)[0];
    return [...inverted, {[name]: id}]
  }, [])
}

function array_to_object(members_array) {
  return members_array.reduce((new_obj, player) => {
    const [key, value] = Object.entries(player)[0];
    return {...new_obj, [key]: value};
  }, {})
}

function members_js_string(members, inverted_members) {
  return `'use strict';
const members = {};

members.idToName = ${JSON.stringify(members, null, 4)};

members.nameToId = ${JSON.stringify(inverted_members, null, 4)};

module.exports = members;
  `
}

function members_store_string(clean_members_array) {
  return `export default {
      members: ${JSON.stringify(clean_members_array, null, 4)}
  }`
}