#!/usr/bin/env node
import {listWorldwideCountries,searchWorldwideCountry} from "../src/worldwide-catalog.mjs";
const [command="countries",...args]=process.argv.slice(2);
const flag=(name,fallback="")=>args.find((x)=>x.startsWith("--"+name+"="))?.slice(name.length+3)??fallback;
if(command==="countries"){
 for(const c of listWorldwideCountries()) console.log(c.code+"\t"+c.visible+"\t"+c.name);
}else if(command==="search"||command==="list"){
 const country=flag("country","GB");
 const query=command==="search"?(flag("query")||args.filter(x=>!x.startsWith("--")).join(" ")):"";
 const limit=Number(flag("limit","50"));
 const offset=Number(flag("offset","0"));
 const result=searchWorldwideCountry(country,{query,category:flag("category"),limit,offset});
 console.log(JSON.stringify(result,null,2));
}else{
 console.error("Usage: npm run worldwide -- countries | list --country=GB | search --country=GB --query=sky [--category=sports] [--limit=50] [--offset=0]");
 process.exitCode=1;
}
