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