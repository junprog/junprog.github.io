// ダイス javascript

function dice(num_side=6, num_dice=1) {
    if (num_side == 10) {
        const min = 0;
        const max = 9;
    } else {
        const min = 1;
        const max = num_side;
    }
    
    let result = 0;
    for (let i = 0; i < num_dice; i++) {
        result += Math.floor(Math.random() * (max - min) + min);
    }

    return result;
}
