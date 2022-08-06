const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');
var search_key = ["Gymnastic","Gym"];
var search_city = ["Arlington,TX,","New York,NY"];
var url = "https://www.local.com/"


async function extractItems(page){  
  let scrapeResults = [];
  const nameXP = "//div[@class='leftDetails']/child::div[@class='webadTitle']/a";
await page.waitForXPath(nameXP);
const names_x = await page.$x(nameXP);
const names = await page.evaluate((...names_x) => {
    return names_x.map((e) => {
      const name = e.textContent.trim();     
      return {name};
    });    
  }, ...names_x);  
  scrapeResults.push(...names); 

  const urlXP = "//div[@class='leftDetails']/child::div[@class='webadTitle']/a";
  await page.waitForXPath(urlXP);
  const links = await page.$x(urlXP);
  const titles_url = await page.evaluate((...links) => {
      return links.map((e) => {
        const url = e.href.trim();     
        return url;
      });    
    }, ...links);  
   
    const phoneXP = "//div[@class='leftDetails']/child::div[@class='webadCnumber ']/child::p[2]";
    await page.waitForXPath(phoneXP);
    const phonesx = await page.$x(phoneXP);
    const phones = await page.evaluate((...phonesx)=>{
       return phonesx.map((e)=>{
          const phone = e.textContent.trim();
          return phone;
       })
    },...phonesx);

    const locationXP = "//div[@class='leftDetails']/child::div[@class='webadTitle']/following-sibling::p[@class='webadAddress']";
    await page.waitForXPath(locationXP);
    const locationsx = await page.$x(locationXP);
    const locations = await page.evaluate((...locationsx)=>{
       return locationsx.map((e)=>{
          const location = e.textContent.trim();
          return location;
       })
    },...locationsx);

    scrapeResults.map((el,i)=>{ 
      el.url = titles_url[i]; 
      el.phone = phones[i];
      el.location = locations[i];
       return el;
  });
  console.log(scrapeResults);
  return scrapeResults;
    
}

async function getCSV(data){
  const csv = new ObjectsToCsv(data);
  await csv.toDisk('./test2.csv');
}
async function main(url){
    let results=[];
    
    const browser = await puppeteer.launch({headless:false});   
    let page = await browser.newPage();    
    await page.goto(url,{waitUntil:'load'}); 
     for(let j=0;j<search_key.length;j++){    
        
      let key = await page.$("input[name='s']");
      let city = await page.$("input[name='ar'");
      let send = await page.$("#headerSearchBtnIn");
      await key.focus();                      
      await key.click({clickCount:3});
      await page.keyboard.press('Backspace');
      await city.focus();
      await city.click({clickCount:3});      
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(1.5);      
      await page.waitForTimeout(3000);       
      await page.waitForSelector("input[name='s']");
      await page.waitForSelector("input[name='ar");
      await page.waitForSelector("#headerSearchBtnIn");
      await key.focus();
      await key.type(search_key[j]);
      await city.focus();
      await city.type(search_city[j]);        
      await send.click();
      await page.waitForTimeout(2000);
      let flag = true;
      let current_url = page.url();
      let i = 1;
      while(flag==true){
        try{
          await page.waitForTimeout(2000);
          results.push(await extractItems(page));
          if(i==1){
            i=i+1;
            continue;
          }         
          next_page_link = await page.$$("a[title='Next']");
          console.log(next_page_link.length);
          if(next_page_link.length>0){      
            var next_page = current_url+i.toString();  
            console.log(next_page); 
            await page.waitForTimeout(2000); 
            await page.goto(next_page); 
            await page.waitForTimeout(2000);
            i = i+1;   
            flag = true;
          }
          else if(next_page_link.length<1){
            await page.waitForTimeout(2000);
            page.waitForNavigation();
            await page.goto(url,{waitUntil:'load'});            
            flag = false;                   
          }      
        }catch(error){
         
        }
      }
   
     }        
  let finalResult = [].concat(...results); 
  await getCSV(finalResult);
  console.log(finalResult);    
  console.log(finalResult.length); 
  await browser.close();   
}
main(url);
