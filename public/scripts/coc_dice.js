// ダイス javascript
function dice(num_side = 6, num_dice = 1) {
    let dice_max = 0;
    let dice_min = 0;

    if (num_side == 10) {
        dice_min = 0;
        dice_max = 9;
    } else {
        dice_min = 1;
        dice_max = num_side;
    }
    
    let result = 0;
    for (let i = 0; i < num_dice; i++) {
        // Math.roundを使用すると端の数値の確率が約半分になるため、Math.floorで均等にする
        result += Math.floor(Math.random() * (dice_max - dice_min + 1)) + dice_min;
    }

    return result;
}

function generalizeDice(num_side = 6, num_dice = 1) {
    let dice_max = 0;
    let dice_min = 0;

    if (num_side == 10) {
        dice_min = 0;
        dice_max = 9;
    } else {
        dice_min = 1;
        dice_max = num_side;
    }
    
    let result_sum = 0;
    const result_list = [];
    for (let i = 0; i < num_dice; i++) {
        const result = Math.floor(Math.random() * (dice_max - dice_min + 1)) + dice_min;
        result_sum += result;
        result_list.push(result);
    }

    return [result_sum, result_list];
}

function percentDice() {
    // 10面ダイスを2回振って1〜100を生成
    // letで宣言し、グローバル汚染を防ぐ
    const digitFirst = dice(10, 1);  // 1桁目 (0-9)
    const digitSecond = dice(10, 1); // 2桁目 (0-9)

    let result = 0;
    if (digitFirst === 0 && digitSecond === 0) {
        result = 100;
    } else {
        result = Number(String(digitSecond) + String(digitFirst));
    }

    return result;
}

function specialDice(num_side = 5) {
    let result = 0;
    // num_side = {5, 4, 3, 2}
    if (num_side == 5) {
        result = Math.ceil(dice(10) / 2);
        if (result == 0) {
            result = 5;
        }
    } else if (num_side == 4) {
        result = Math.ceil(dice(8) / 2);
    } else if (num_side == 3) {
        result = Math.ceil(dice(6) / 2);
    } else if (num_side == 2) {
        const d6 = dice(6);
        if (d6 == 1 || d6 == 2 || d6 == 3) {
            result = 1;
        } else if (d6 == 4 || d6 == 5 || d6 == 6) {
            result = 2;
        }
    }

    return result;
}

function twentyDice() {
    let result = 0;

    const dice10 = dice(10, 1);
    const dice6 = dice(6, 1);

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

    return [num_side, num_dice];
}

// ダイス回転アニメーションの共通化
function animateRoll(elements, duration = 200) {
    $(elements).each(function() {
        const img = this;
        $(img).animate({ zIndex: 1 }, {
            duration: duration,
            step: function(now) {
                $(img).css({ transform: 'rotate(' + (now * 360) + 'deg)' });
            },
            complete: function() {
                $(img).css('zIndex', 0);
            }
        });
    });
}

// ダイス判定とアニメーション実行
function diceRoll(event) {
    const imgObject = event.target;
    animateRoll(imgObject);

    const [num_side, num_dice] = defineSideDice($(imgObject).attr("id"));
    const res = dice(num_side, num_dice);
    $(imgObject).parent().children('.res-box').text(res);
}

function percentDiceRoll(event) {
    const imgObject = event.target;
    const multiDiceObject = $(imgObject).parent();
    const diceImgList = $(multiDiceObject).children("img");

    animateRoll(diceImgList);

    const res = percentDice();
    const resBox = $(multiDiceObject).parent().children('.res-box');
    resBox.text(res);

    if (res < 6) {
        resBox.css("color", "#0000FF"); // クリティカル
    } else if (res > 95) {
        resBox.css("color", "#FF0000"); // ファンブル
    } else {
        resBox.css("color", "var(--main-text-color)");
    }
}

function twentyDiceRoll(event) {
    const imgObject = event.target;
    const multiDiceObject = $(imgObject).parent();
    const diceImgList = $(multiDiceObject).children("img");

    animateRoll(diceImgList);

    const res = twentyDice();
    $(multiDiceObject).parent().children('.res-box').text(res).css("color", "var(--main-text-color)");
}

function specialDiceRoll(event, num_side) {
    const imgObject = event.target;
    animateRoll(imgObject);
    
    const res = specialDice(num_side);
    $(imgObject).parent().children('.res-box').text(res);
}

function ccbDiceRoll(event) {
    const imgObject = event.target;
    const multiDiceObject = $(imgObject).parent();
    const diceImgList = $(multiDiceObject).children("img");

    animateRoll(diceImgList);

    const res = percentDice();
    const skill_el = document.getElementById("skill");
    let judge_log = "";

    if (skill_el) {
        const skill_val = parseInt(skill_el.value, 10);
        if (res <= skill_val) {
            judge_log = "成功";
        } else {
            judge_log = "失敗";
        }
    }

    if (res < 6) {
        judge_log += " クリティカル！";
    } else if (res > 95) {
        judge_log += " ファンブル！";
    }

    const resBox = $(multiDiceObject).parent().children('.res-box');
    resBox.text(res);

    if (res < 6) {
        resBox.css("color", "#0000FF");
    } else if (res > 95) {
        resBox.css("color", "#FF0000");
    } else {
        resBox.css("color", "var(--main-text-color)");
    }
    $(multiDiceObject).parent().parent().children('.all-res-box').text(judge_log);
}

function generalizeDiceRoll(event) {
    const runObject = event.target;
    animateRoll(runObject);

    const num_dice_el = document.getElementById("num-dice");
    const num_side_el = document.getElementById("num-side");

    if (num_dice_el && num_side_el) {
        const num_side = parseInt(num_side_el.value, 10);
        const num_dice = parseInt(num_dice_el.value, 10);
        const [res, res_list] = generalizeDice(num_side, num_dice);

        $(runObject).parent().children('.res-box').text(res);
        $(runObject).parent().parent().children('.all-res-box').text(res_list.join(", "));
    }
}