const fs = require('fs');

let str1 = '{"a": "b\\nc"}'; // Valid JSON (has \\n sequence)
let str2 = '{\n"a": "b\nc"\n}'; // Invalid JSON (has raw \n inside string)

try { console.log("str1 parsed:", JSON.parse(str1)); } catch (e) { console.log("str1 failed"); }
try { console.log("str2 parsed:", JSON.parse(str2)); } catch (e) { console.log("str2 failed!!"); }

// Fix logic: replace raw \n, \r, \t with space? 
// Actually, if we replace all raw \n with space, then str2 becomes: '{ "a": "b c" }' which parses!
let fixedStr2 = str2.replace(/[\n\r\t]/g, " ");
try { console.log("fixedStr2 parsed:", JSON.parse(fixedStr2)); } catch (e) { console.log("fixedStr2 failed!!"); }

// What about trailing commas?
let str3 = '{"a": "b",}';
let fixedStr3 = str3.replace(/,(\s*[\]}])/g, '$1');
try { console.log("fixedStr3 parsed:", JSON.parse(fixedStr3)); } catch (e) { console.log("fixedStr3 failed!!"); }
