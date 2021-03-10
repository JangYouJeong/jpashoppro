var number = [1,4,123,35,6,546,6,65,34,3];
var i = 0;
var total = 0;
while(i<number.length) {
  console.log(number[i]);
  total=total+number[i];
  i=i+1;
}
console.log(`total: ${total}`);
