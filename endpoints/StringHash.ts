export function StringHash(str:string) {
    const MOD:number = 18446744073709551615;
    let h:number = 0;

    for(let i:number = 0; i < str.length; i++){
        h = ((7 * h) + str.charCodeAt(i)); 
    }
    if(h < 0 ) {
        h *= -1;
    }
    
    return (h % MOD)
}