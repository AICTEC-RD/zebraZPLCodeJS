//ZPL Barcode Generator
//Ported from java to js 
//31/06/22


//initializing Variable
var printerDotsInHead=8;
var dpi=210;
var widthInMM=50.80; //Label width in MM
var heightInMM=25.40; // Lable height in MM
//var widthInMM=60; //Label width in MM
//var heightInMM=40; // Lable height in MM
var fontSizeInPoints=19; // Font Size in fontSizeInPoints - Starting point for iteratorn


//test variables
var text = "8-port 10/100/1000Base-T Unmanaged Switch with 4 PoE , 52W PoE Power budget (EU/UK Plug)";
const words = text.split(' ');
var barcode= "123456"; //Initial Value
//console.log(words);

//logic to break text if word is too long
for(var i=0;i<words.length;i++)
{
    if(words[i].length > 13)
    {
        if(words[i].includes("/") || words[i].includes("-"))
        {
          while(words[i].includes("/") && !(words[i].includes(" /")) )
          words[i]=words[i].replace("/"," /");
          while(words[i].includes("-"))
          words[i]=words[i].replace("-"," ");    
        }
        else{
          words[i]=splitText(words[i],Math.ceil(words[i].length/2)); 
        }
    }
}
text=words.join(" ");


//formulas
var horizontalLimitFactorInitial=fontSizeInPoints/10;
var charHorizontalSize=(widthInMM/5); 

var textRegionHeight=heightInMM/2;
var barcodeRegionHeight=heightInMM/2;


var textRegionHeightInDots=textRegionHeight*printerDotsInHead;
var barcodeRegionHeightInDots=barcodeRegionHeight*printerDotsInHead;

var widthInDots=Math.ceil(widthInMM*printerDotsInHead);
var heightInDots=Math.ceil(heightInMM*printerDotsInHead);

var factor=charHorizontalSize/fontSizeInPoints; //factor is the fontSizeInPoints to character convertion multiplier
var fontSizeInDots=((fontSizeInPoints/72)*dpi); // Font size in fontSizeInDots


// Get Best fit for TextRegion
var t = wordWrap(text,Math.ceil(fontSizeInPoints*factor))
var lines = t;
var fontHeightinDots=((fontSizeInPoints/72)*dpi);
var maxHeightOfLines=1;

maxHeightOfLines=lines.length*fontHeightinDots; //initial height of lines


//Fit finding loop for font size, no of lines and text region
while(maxHeightOfLines>textRegionHeightInDots )
{
fontSizeInPoints=fontSizeInPoints-1;
fontHeightinDots=((fontSizeInPoints/72)*dpi); 
console.log(fontSizeInPoints);
fontSizeInDots=((fontSizeInPoints/72)*dpi);
factor=charHorizontalSize/fontSizeInPoints;
lines = wordWrap(text,Math.ceil(widthInDots*factor*0.05)) // calibrated to the custom font size
maxHeightOfLines=lines.length*fontHeightinDots;
console.log("max Height of Lines :"+maxHeightOfLines+"No of Lines :"+lines.length+"Font Size :"+fontSizeInPoints);
}

var spaceBwLines=10; //initailize the top margin
var arrayLength = lines.length;
var textZPLCode=[];

//Individial Lines ZPL Code creation loop
for (var i = 0; i < arrayLength; i++) {
var line = lines[i];
var lengthOfLine=line.length;
//We format each line instead of using single FD to avoid truncating and overwriting problems
textZPLCode.push("^FO10,"+spaceBwLines+"^A0,"+fontSizeInDots+"^FB"+widthInDots+",4,0,C^FD"+line+"^FS");
spaceBwLines=spaceBwLines+Math.floor(fontSizeInDots);
}


//Get Best Fit size and allignment for Barcode Region
var dotsPerLine=2;
dotsPerLineofBCode = barcode.length <6 ? 3 : 2;

//Reference : https://stackoverflow.com/questions/31793803/how-to-calculate-the-width-in-fontSizeInDots-of-this-zpl-barcode
//dyanamic formula for different dpi and label width
lengthOfBcodeInDots=(34+(barcode.length*11))*dotsPerLineofBCode;
//TODO: if the length of the barcode is greater than the width of the barcode
bCodeXposition=(widthInDots-lengthOfBcodeInDots)/2;
var bCodeZPL="^FO"+bCodeXposition+","+textRegionHeightInDots+"^BY"+dotsPerLineofBCode+"\\^BCN,"+barcodeRegionHeightInDots*0.7+",Y,N,N^FD"+barcode+"^FS";



//Format the ZPL code for product barcode template
//Intializers
var zplInit=[
'^XA',
'^MMT',
'^PW'+widthInDots,
'^LL'+heightInDots,
]
//TextRegion
var zplCode=zplInit.concat(textZPLCode);
//BarcodeRegion
zplCode.push(bCodeZPL);
//End
zplCode.push('^XZ');
//This is the final output code for product barcode template






//Third party function for wordwrap - javascript
//https://gist.github.com/bgrayburn/44fa018b94222590f618
function wordWrap(str, charMax) {
    let arr = [];
    let space = /\s/;

    const words = str.split(space);
    // push first word into new array
    if (words[0].length) {
        arr.push(words[0]);
    }

    for (let i = 1; i < words.length; i++) {
        if (words[i].length + arr[arr.length - 1].length < charMax) {
            arr[arr.length - 1] = `${arr[arr.length - 1]} ${words[i
            ]}`;
        } else {
            arr.push(words[i]);
        }
    }

    //console.log('arr', arr);
    return arr;
}

//function to split text at an index
function splitText(value, index) {
    if (value.length < index) {return value;} 
    return [value.substring(0, index)].concat(splitText(value.substring(index), index));
  }