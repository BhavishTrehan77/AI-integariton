export const chunkText=(text,textSize,overlap)=>{
    const chunks=[]

    for(let i=0;i<text.length;i+=textSize-overlap){
        chunks.push(text.slice(i,i+textSize))
    }
    return chunks
}

const text = "abcdefghijklmnopqrstuvwxyz";
console.log(chunkText(text, 5,3));

export const chunkTextByWords=async(text,textSize,overlap)=>{
    const words=text.trim().split(/\s/)
    const chunks=[]
    for(let i=0;i<words.length;i+=textSize-overlap){
        const chunk=words.slice(i,i+textSize)
        chunks.push(chunk.join(" "))
    }
    return chunks;
}
const text2 = "AI is a very powerful technology used in modern applications";

console.log(chunkTextByWords(text2, 5, 2));