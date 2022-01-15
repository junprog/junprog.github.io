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

function percentDice(num_dice=1) {
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

$(".dice-img").click(function () {
    $(this).animate({zIndex:1},{
        //0.3秒かけてアニメーション
        duration: 200,
        //stepは、アニメーションが進むたびに呼ばれる
        step:function(now){
            //nowに現在のz-indexの値（0から1に変化しているところ）が渡してもらえる
            //0から1に向かって変化していくnowを利用して3回転（1080度）させてみる
            $(this).css({transform:'rotate(' + (now * 360) + 'deg)'});
        },
        //終わったら
        complete:function(){
            //次のために、元に戻しておく
            $(this).css('zIndex', 0);
        }
    })

    // ダイス判定
    var [num_side, num_dice] =  defineSideDice($(this).attr("id"));
    
    $(this).parent().children('.res-box').text(dice(num_side=num_side, num_dice=num_dice));
});

$(".multi-dice-img").click(function () {
    var diceImgList = $(this).children("img");

    for (let i = 0; i < diceImgList.length; i++) {
        diceImgList[i].animate({zIndex:1},{
            //0.3秒かけてアニメーション
            duration: 200,
            //stepは、アニメーションが進むたびに呼ばれる
            step:function(now){
                //nowに現在のz-indexの値（0から1に変化しているところ）が渡してもらえる
                //0から1に向かって変化していくnowを利用して3回転（1080度）させてみる
                diceImgList[i].css({transform:'rotate(' + (now * 360) + 'deg)'});
            },
            //終わったら
            complete:function(){
                //次のために、元に戻しておく
                diceImgList[i].css('zIndex', 0);
            }
        })
    }

    $(this).parent().children('.res-box').text(percentDice());

});
