// ダイス javascript
function dice(num_side=6, num_dice=1) {
    let dice_max = 0;
    let dice_min = 0;

    if (num_side == 10){
        dice_min = 0;
        dice_max = 9;
    }else{
        dice_min = 1;
        dice_max = num_side;
    }
    
    let result = 0;
    for (let i = 0; i < num_dice; i++) {
        result += Math.round(Math.random() * (dice_max - dice_min) + dice_min);
    }

    return result;
}

function generalizeDice(num_side=6, num_dice=1) {
    let dice_max = 0;
    let dice_min = 0;

    if (num_side == 10){
        dice_min = 0;
        dice_max = 9;
    }else{
        dice_min = 1;
        dice_max = num_side;
    }
    
    let result = 0;
    let result_sum = 0;
    let result_list = [];
    for (let i = 0; i < num_dice; i++) {
        result = Math.round(Math.random() * (dice_max - dice_min) + dice_min);
        result_sum += result;
        result_list.push(result);
    }

    return [result_sum, result_list];
}

function percentDice() {
    let result = 0;

    digitFirst = dice(num_side=10, num_dice=1); // - *
    digitSecond = dice(num_side=10, num_dice=1); // * -

    if (digitFirst == 0 && digitSecond == 0) {
        result = 100;
    } else {
        result = Number(String(digitSecond) + String(digitFirst));
    }

    return result;
}

function specialDice(num_side=5) {
    let result = 0;
    // num_side = {5, 4, 3, 2}
    if (num_side == 5) {
        result = Math.ceil(dice(10)/2);
        if (result == 0) {
            result = 5;
        }
    } else if (num_side == 4) {
        result = Math.ceil(dice(8)/2);
    } else if (num_side == 3) {
        result = Math.ceil(dice(6)/2);
    } else if (num_side == 2) {
        result = dice(6);
        if (result == 1 || result == 2 || result == 3 ) {
            result = 1;
        } else if (result == 4 || result == 5 || result == 6 ) {
            result = 2;
        }
    }

    return result;
}

function twentyDice() {
    let result = 0;

    dice10 = dice(num_side=10, num_dice=1);
    dice6 = dice(num_side=6, num_dice=1);

    if (dice6 == 1 || dice6 == 2 || dice6 == 3) {
        if (dice10 == 0) {
            result = 10;
        } else {
            result = dice10;
        }
    } else {
        if (dice10 == 0) {
            result = 20;
        } else {
            result = dice10 + 10;
        }
    }

    return result;
}

function defineSideDice(diceId) {
    let num_side = 0;
    let num_dice = 0;

    if (diceId == 'dice-6') {
        num_side = 6;
        num_dice = 1;
    } else if (diceId == 'dice-8') {
        num_side = 8;
        num_dice = 1;
    } else if (diceId == 'dice-10') {
        num_side = 10;
        num_dice = 1;
    }

    return  [num_side, num_dice];
}

// ダイスアニメーション
function diceRoll() {
    var imgObject = event.target;
    
    $(imgObject).animate({zIndex:1},{
        //0.3秒かけてアニメーション
        duration: 200,
        //stepは、アニメーションが進むたびに呼ばれる
        step:function(now){
            //nowに現在のz-indexの値（0から1に変化しているところ）が渡してもらえる
            //0から1に向かって変化していくnowを利用して3回転（1080度）させてみる
            $(imgObject).css({transform:'rotate(' + (now * 360) + 'deg)'});
        },
        //終わったら
        complete:function(){
            //次のために、元に戻しておく
            $(imgObject).css('zIndex', 0);
        }
    })

    // ダイス判定
    var [num_side, num_dice] =  defineSideDice($(imgObject).attr("id"));
    
    $(imgObject).parent().children('.res-box').text(dice(num_side=num_side, num_dice=num_dice));
}

function percentDiceRoll() {
    var imgObject = event.target;
    var multiDiceObject = $(imgObject).parent();

    var diceImgList = $(multiDiceObject).children("img");

    for (let i = 0; i < diceImgList.length; i++) {
        $(diceImgList[i]).animate({zIndex:1},{
            //0.3秒かけてアニメーション
            duration: 200,
            //stepは、アニメーションが進むたびに呼ばれる
            step:function(now){
                //nowに現在のz-indexの値（0から1に変化しているところ）が渡してもらえる
                //0から1に向かって変化していくnowを利用して3回転（1080度）させてみる
                $(diceImgList[i]).css({transform:'rotate(' + (now * 360) + 'deg)'});
            },
            //終わったら
            complete:function(){
                //次のために、元に戻しておく
                $(diceImgList[i]).css('zIndex', 0);
            }
        })
    }

    var res = percentDice()
    if (res < 6) {
        $(multiDiceObject).parent().children('.res-box').text(res).css("color", "#0000FF");
    } else if (res > 95) {
        $(multiDiceObject).parent().children('.res-box').text(res).css("color", "#FF0000");
    } else {
        $(multiDiceObject).parent().children('.res-box').text(res).css("color", "var(--main-text-color)");
    }
}

function twentyDiceRoll() {
    var imgObject = event.target;
    var multiDiceObject = $(imgObject).parent();

    var diceImgList = $(multiDiceObject).children("img");

    for (let i = 0; i < diceImgList.length; i++) {
        $(diceImgList[i]).animate({zIndex:1},{
            //0.3秒かけてアニメーション
            duration: 200,
            //stepは、アニメーションが進むたびに呼ばれる
            step:function(now){
                //nowに現在のz-indexの値（0から1に変化しているところ）が渡してもらえる
                //0から1に向かって変化していくnowを利用して3回転（1080度）させてみる
                $(diceImgList[i]).css({transform:'rotate(' + (now * 360) + 'deg)'});
            },
            //終わったら
            complete:function(){
                //次のために、元に戻しておく
                $(diceImgList[i]).css('zIndex', 0);
            }
        })
    }

    var res = twentyDice()
    $(multiDiceObject).parent().children('.res-box').text(res).css("color", "var(--main-text-color)");
}

function specialDiceRoll(num_side) {
    var imgObject = event.target;
    
    $(imgObject).animate({zIndex:1},{
        //0.3秒かけてアニメーション
        duration: 200,
        //stepは、アニメーションが進むたびに呼ばれる
        step:function(now){
            //nowに現在のz-indexの値（0から1に変化しているところ）が渡してもらえる
            //0から1に向かって変化していくnowを利用して3回転（1080度）させてみる
            $(imgObject).css({transform:'rotate(' + (now * 360) + 'deg)'});
        },
        //終わったら
        complete:function(){
            //次のために、元に戻しておく
            $(imgObject).css('zIndex', 0);
        }
    })
    
    $(imgObject).parent().children('.res-box').text(specialDice(num_side=num_side));
}

function ccbDiceRoll() {
    var imgObject = event.target;
    var multiDiceObject = $(imgObject).parent();

    var diceImgList = $(multiDiceObject).children("img");

    for (let i = 0; i < diceImgList.length; i++) {
        $(diceImgList[i]).animate({zIndex:1},{
            //0.3秒かけてアニメーション
            duration: 200,
            //stepは、アニメーションが進むたびに呼ばれる
            step:function(now){
                //nowに現在のz-indexの値（0から1に変化しているところ）が渡してもらえる
                //0から1に向かって変化していくnowを利用して3回転（1080度）させてみる
                $(diceImgList[i]).css({transform:'rotate(' + (now * 360) + 'deg)'});
            },
            //終わったら
            complete:function(){
                //次のために、元に戻しておく
                $(diceImgList[i]).css('zIndex', 0);
            }
        })
    }

    var res = percentDice()
    let skill_el = document.getElementById("skill");
    let judge_log = "";

    if (res <= skill_el.value){
        judge_log = "成功";
    } else {
        judge_log = "失敗";
    }

    if (res < 6) {
        judge_log = judge_log + " クリティカル！";
    } else if (res > 95) {
        judge_log = judge_log + " ファンブル！";
    }

    if (res < 6) {
        $(multiDiceObject).parent().children('.res-box').text(res).css("color", "#0000FF");
    } else if (res > 95) {
        $(multiDiceObject).parent().children('.res-box').text(res).css("color", "#FF0000");
    } else{
        $(multiDiceObject).parent().children('.res-box').text(res).css("color", "var(--main-text-color)");
    }
    $(multiDiceObject).parent().parent().children('.all-res-box').text(judge_log);
}

function generalizeDiceRoll() {
    var runObject = event.target;

    $(runObject).animate({zIndex:1},{
        //0.3秒かけてアニメーション
        duration: 200,
        //stepは、アニメーションが進むたびに呼ばれる
        step:function(now){
            //nowに現在のz-indexの値（0から1に変化しているところ）が渡してもらえる
            //0から1に向かって変化していくnowを利用して3回転（1080度）させてみる
            $(runObject).css({transform:'rotate(' + (now * 360) + 'deg)'});
        },
        //終わったら
        complete:function(){
            //次のために、元に戻しておく
            $(runObject).css('zIndex', 0);
        }
    })

    let num_dice_el = document.getElementById("num-dice");
    let num_side_el = document.getElementById("num-side");

    var [res, res_list] = generalizeDice(num_side=num_side_el.value, num_dice=num_dice_el.value);

    $(runObject).parent().children('.res-box').text(res);
    $(runObject).parent().parent().children('.all-res-box').text(res_list);
}