const loadAllItems = require('./datbase.js');
const loadPromotions = require('./datbase_1.js');

/*统计商品信息（包括商品的条形码、名称和数量等）*/
function countItems(inputs ){
    var itemInfo = loadAllItems();
    var resCollection = new Array();
    var sym = /-/;
    
    inputs.forEach(function(elem){
        let elemBarCode = elem.replace(sym,',').split(',')[0];  //存储的是条形码号码，例如“ITEM000002-3”.
        let elemNum = elem.replace(sym,',').split(',')[1] ? parseInt(elem.replace(sym,',').split(',')[1]):1;
        for(let i = 0; i < resCollection.length; i++){
            if(resCollection[i].barcode == elemBarCode){
              resCollection[i].count += elemNum;
                return ;
            }
        }
        itemInfo.forEach(function(obj){
            if(obj.barcode == elemBarCode){
                resCollection.push({
                    name: obj.name,
                    count: elemNum,
                    barcode: obj.barcode,
                    unit: obj.unit,
                    unitPrice: obj.price
                    
                });
            }
        })
    })
    return resCollection;
}

/*统计优惠商品信息*/

function countPromotions(items, loadPromotions){
    var promotionInfo = loadPromotions();
    var resPromotions = [];
    
    items.forEach(function(elem){
        
        if(promotionInfo[0].barcodes.indexOf(elem.barcode) >= 0){
            var promotionNum = Math.floor(elem.count/3);
            resPromotions.push({
                name:   elem.name,
                count:  promotionNum,
                unit:   elem.unit
            })
        }
    })
    return resPromotions;
}
/*创建购物列表*/
function buildShoppingList_Head(items, promotions){
    var listHead = "***<没钱赚商店>购物清单***\n";
    //var listMidPromotion = "挥泪赠送商品：\n";
    items.forEach(function(elem){
        let elemTotal = elem.count * elem.unitPrice;
        promotions.forEach(function(obj){
            if(obj.name == elem.name){
                elemTotal -= obj.count * elem.unitPrice;
            }
        })
        listHead += "名称：" + elem.name +"，数量："+ elem.count + elem.unit +"，单价：" + elem.unitPrice.toFixed(2)  
                    + "(元)，小计：" + elemTotal.toFixed(2) + "(元)\n";
    })
    return listHead;
}
/*创建优惠产品列表*/
function buildShoppingList_Promotions(promotions){
    var listPromotions = "挥泪赠送商品：\n";
    promotions.forEach(function(elem){
        listPromotions += "名称：" + elem.name +"，数量：" + elem.count + elem.unit + "\n";
    })
    return listPromotions;
}

function buildShoppingList_TotalInfo(items,promotions){
    var totalCost =0, totalSaved = 0, totalInfo = "";
    items.forEach(function(elem){
        let elemTotal = elem.count * elem.unitPrice;
        
        promotions.forEach(function(obj){
            if(elem.name == obj.name){
                elemTotal -= obj.count * elem.unitPrice;
                totalSaved += obj.count * elem.unitPrice;
            }
        });
        totalCost += elemTotal;
    })
    totalInfo += "总计：" + totalCost.toFixed(2) + "(元)\n" + "节省：" + totalSaved.toFixed(2) + "(元)\n";
    return totalInfo;
}

function buildPrintText(items, promotions){
    var listHead, listPromotions, totalInfo, outputText = "";
    listHead = buildShoppingList_Head(items, promotions);
    listPromotions = buildShoppingList_Promotions(promotions);
    totalInfo = buildShoppingList_TotalInfo(items,promotions);
    outputText = listHead + 
                 "----------------------\n" +
                 listPromotions +
                 "----------------------\n" +
                 totalInfo +
                 "**********************";
    return outputText;
}
//主函数
module.exports = function printInventory(inputs) {
    var items = countItems(inputs,loadAllItems);
    var promotions = countPromotions(items,loadPromotions);
    var outPutContent = buildPrintText(items, promotions);
    console.log(outPutContent);
};