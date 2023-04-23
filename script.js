"use strict"
/* 
  Importo i due array il codice citta e un arrai con tutte le provincie
  l'array province serve per trovare l'indice da passare all'array cod_citta
  che poi passera il codice citta
*/
import { cod_citta, provincia as arrProvincia} from "./cod_citta.js";

const calcola = document.getElementById('calcola');
const textAreaCF = document.getElementById('textAreaCF');
const copiaCF = document.getElementById('copiaCF');


const inputCognome = document.getElementById('inputCognome');
const inputNome = document.getElementById('inputNome');
const sesso = document.getElementById('sesso');
const inputLuogoNascita = document.getElementById('inputLuogoNascita');
const inputProvincia = document.getElementById('inputProvincia');
const data = document.getElementById('data');

// Map che serve per trovare la lettera da aggiungere al codice fiscale
const mapMesi = new Map();

mapMesi.set('01', 'A');
mapMesi.set('02', 'B');
mapMesi.set('03', 'C');
mapMesi.set('04', 'D');
mapMesi.set('05', 'E');
mapMesi.set('06', 'H');
mapMesi.set('07', 'L');
mapMesi.set('08', 'M');
mapMesi.set('09', 'P');
mapMesi.set('10', 'R');
mapMesi.set('11', 'S');
mapMesi.set('12', 'T');

// Map invece che serve alla fine per aggiungere il codice di controllo
// dopo aver fatto tutto il calcolo dei caratteri pari e dispari
const mapValControl = new Map();

mapValControl.set(0, 'A');
mapValControl.set(14, 'O');
mapValControl.set(1, 'B');
mapValControl.set(15, 'P');
mapValControl.set(2, 'C');
mapValControl.set(16, 'Q');
mapValControl.set(3, 'D');
mapValControl.set(17, 'R');
mapValControl.set(4, 'E');
mapValControl.set(18, 'S');
mapValControl.set(5, 'F');
mapValControl.set(19, 'T');
mapValControl.set(6, 'G');
mapValControl.set(20, 'U');
mapValControl.set(7, 'H');
mapValControl.set(21, 'V');
mapValControl.set(8, 'I');
mapValControl.set(22, 'W');
mapValControl.set(9, 'J');
mapValControl.set(23, 'X');
mapValControl.set(10, 'K');
mapValControl.set(24, 'Y');
mapValControl.set(11, 'L');
mapValControl.set(25, 'Z');
mapValControl.set(12, 'M');
mapValControl.set(13, 'N');



// Listner che fa tutto il calcolo del codice fiscale

calcola.addEventListener('click', ()=>{
    // console.log(inputCognome.value, inputNome.value, sesso.value, inputLuogoNascita.value, data.value);

    // Recupero valori dagli input
    let cognome = inputCognome.value;
    let nome = inputNome.value;
    let s = sesso.value;
    let LuogoNascita = inputLuogoNascita.value;
    let d = data.value;
    
    // Una serie di if else per evidenziare i campi mancanti
    if(cognome.length === 0){
        inputCognome.style.border = "2px solid red";
    }else{
        inputCognome.style.border = "";
    }
    if(nome.length === 0){
        inputNome.style.border = "2px solid red";
    }else{
        inputNome.style.border = "";
    }
    if(LuogoNascita.length === 0){
        inputLuogoNascita.style.border = "2px solid red";
    }else{
        inputLuogoNascita.style.border = "";
    }
    if(d.length === 0){
        data.style.border = "2px solid red";
    }else{
        data.style.border = "";
    }

    /* 
      if che viene eseguita solo se tutti i campi sono stati riempiti
       e chiama tutte le funzioni per fare il calcolo 
    */
    if(cognome.length !== 0 && nome.length !== 0 && LuogoNascita.length !== 0 && d.length !== 0){
        //console.log("Est cognome: " + estraiConsonati(cognome));
        //console.log("Es nome: " + estraiConsonati(nome));

        /* Variabile che conterra il codice fiscale */
        let codiceFiscale = estraiStringa(cognome); // Chiamo la funzione per le tre lettere del cognome
        codiceFiscale += estraiStringa(nome); // Richiamo per le tre lettere del nome

        // Splitto la stringa della data in un array
        const arrData = d.split("-");

        codiceFiscale += arrData[0].substring(2, 4); // Estraggo le ultime due cifre dell'anno

        /* 
          Estraggo la lettera corrispondente al mese passando la chiave alla mapMesi
          precedentemente creata
        */
        codiceFiscale += mapMesi.get(arrData[1]);

        // if che aggiunge + 40 al giorno di nascita se la persona è una donna
        if(s === "M" ){
            codiceFiscale += arrData[2];
        }else{
            let n = Number(arrData[2]) + 40 // Trasformo la stringa in numero e aggiungo 40
            codiceFiscale +=  n.toString(); // Ritrasformo il numero in stringa
        }
        
        /* 
          Aggiunta del codice citta chiamando la funzione trova codice e passo il luogo di
          nascita e i due arrai quello della provincia e quello dove ci sono i codici
          i due array si trovano nel file cod_citta.js e vangono importati tramite i moduli
        */
        codiceFiscale += trovaCodice(LuogoNascita, arrProvincia, cod_citta);

        //console.log(charPari(codiceFiscale));

        /* 
          Chiamo la funzione codiceControllo che fa tutti i calcoli che sono descritti
          nel documento del Ministero
        */
        codiceFiscale +=  codiceControllo(codiceFiscale);

        textAreaCF.value = codiceFiscale; // Il codice fiscale e calcolato e viene immesso nella textArea
        
    }

});

// Funzione Estrai consonanti e vocali

/* 
  Funzione che estrae le prime tre consonanti e se non sono sufficenti aggiunge delle vocali */

function estraiStringa(str){
    
    // Trasformiamo la stringa in input in maiusolo e nel caso di piu cognomi o 
    // nomi eliminiamo gli spazi
    str = str.toUpperCase().replaceAll(" ", ""); 
    let strReturn = "";
    const regexConsonant = /[^aeiou]/gi; // Regular expression per mecciare le consonanti
    const regexVocal = /[aeiou]/gi; // Regular expression per mecciare le vocali

    if(str.length === 3) // Se il nome è composto da 3 lettere lo restituiamo cosi com'è
        return str;

    /* 
      Mecciamo le consonanti, trasformo l'arrey restituito da match() in stringa
      elimino le virgole e prendo solo le prime tre consonanti 
    */
    strReturn = str.match(regexConsonant).toString().replaceAll(",", "").substring(0, 3);
    
    if(strReturn.length < 3){ // Verifico che siano 3 caratteri nel caso aggiungo le vocali
        strReturn += str.match(regexVocal).toString().replaceAll(",", "");
    }
    
    return strReturn.substring(0, 3); // Ritorno la stringa ma solo i primi tre caratteri

}

/*
  La funzione trova codice prende in input la provincia di nascita, l'array delle province
  e l'array dei codici che si trovano nell'file cod_citta.js e scorrendo l'array delle province
  trova l'indice da passare all'array cod_citta per trovare il codice corrispondente.
*/
function trovaCodice(provincia, arrProvincia, cod_citta){
    provincia = provincia.toUpperCase();

    for (let i = 0; i <= arrProvincia.length; i++){
        if( arrProvincia[i] === provincia){
            return cod_citta[i];
        }
    }
    return -1;
}

/* 
  La funzione codiceControllo calcola appunto il codice di controllo con le istruzioni del 
  documento del Ministero n.345 23/12/1976
*/

function codiceControllo(str){
    
    const pari = charPari(str); // charPari() restituisce una stringa dei soli caratteri che 
                                // si trovano in posizione pari del codice precedentemente calcolato
    const dispari = charDispari(str); // charDispari idem solo caratteri in posizione dispari
    //console.log("pari: " + pari);
    //console.log("dispari: " + dispari);
    let numPari = 0;
    let numDispari = 0;

    /* 
      Questo for calcola la somma dei caratteri in posizione pari, sempre seguendo le
      istruzioni del documento e verifica i vari casi con uno switch che viene chiamato 7 volte
    */
    for(let i = 0; i<pari.length; i++){
        
        switch(pari[i]){
            case '0': case 'A': numPari += 0;
          break;
        case '1': case 'B': numPari += 1;
          break;
        case '2': case 'C': numPari += 2;
          break;
        case '3': case 'D': numPari += 3;
          break;
        case '4': case 'E': numPari += 4;
          break;
        case '5': case 'F': numPari += 5;
          break;
        case '6': case 'G': numPari += 6;
          break;
        case '7': case 'H': numPari += 7;
          break;
        case '8': case 'I': numPari += 8;
          break;
        case '9': case 'J': numPari += 9;
          break;
        case 'K': numPari += 10;
          break;
        case 'L': numPari += 11;
          break;
        case 'M': numPari += 12;
          break;
        case 'N': numPari += 13;
          break;
        case 'O': numPari += 14;
          break;
        case 'P': numPari += 15;
          break;
        case 'Q': numPari += 16;
          break;
        case 'R': numPari += 17;
          break;
        case 'S': numPari += 18;
          break;
        case 'T': numPari += 19;
          break;
        case 'U': numPari += 20;
          break;
        case 'V': numPari += 21;
          break;
        case 'W': numPari += 22;
          break;
        case 'X': numPari += 23;
          break;
        case 'Y': numPari += 24;
          break;
        case 'Z': numPari += 25;
          break;
        }
    }

    /* 
      Questo for calcola la somma dei caratteri in posizione dispari, sempre seguendo le
      istruzioni del documento e verifica i vari casi con uno switch che viene chiamato 8 volte
    */

    for(let i = 0; i<dispari.length; i++){
        switch (dispari[i]) {
            case '0': case 'A': numDispari += 1;
              break;
            case '1': case 'B': numDispari += 0;
              break;
            case '2': case 'C': numDispari += 5;
              break;
            case '3': case 'D': numDispari += 7;
              break;
            case '4': case 'E': numDispari += 9;
              break;
            case '5': case 'F': numDispari += 13;
              break;
            case '6': case 'G': numDispari += 15;
              break;
            case '7': case 'H': numDispari += 17;
              break;
            case '8': case 'I': numDispari += 19;
              break;
            case '9': case 'J': numDispari += 21;
              break;
            case 'K': numDispari += 2;
              break;
            case 'L': numDispari += 4;
              break;
            case 'M': numDispari += 18;
              break;
            case 'N': numDispari += 20;
              break;
            case 'O': numDispari += 11;
              break;
            case 'P': numDispari += 3;
              break;
            case 'Q': numDispari += 6;
              break;
            case 'R': numDispari += 8;
              break;
            case 'S': numDispari += 12;
              break;
            case 'T': numDispari += 14;
              break;
            case 'U': numDispari += 16;
              break;
            case 'V': numDispari += 10;
              break;
            case 'W': numDispari += 22;
              break;
            case 'X': numDispari += 25;
              break;
            case 'Y': numDispari += 24;
              break;
            case 'Z': numDispari += 23;
              break;
          }
    }
    const numTot = numPari + numDispari; // somma totale dei due risultati parziali

    //console.log("numTot:" + numTot);

    const resto = numTot % 26; // Resto della divisione del totale per 26 
    //console.log("resto:" + resto);

    // Estrazione del carattere di controllo tramitel la chiave di tipo numerico
    // nella mappa che ho generato sempre partendo dalle istruzioni del documento
    return mapValControl.get(resto); 

}

function charPari(str){
    let s = "";
    for(let i = 0; i<str.length; i++){
        if( (i % 2) == 1)
            s += str[i];
    }
    return s;
}

function charDispari(str){
    let s = "";
    for(let i = 0; i<str.length; i++){
        if( (i % 2) == 0)
            s += str[i];
    }
    return s;
}

// Semplice funzione che copia il contenuto della textarea dove c'è mostrato il codice fiscale
copiaCF.addEventListener('click', () =>{
  console.log("event copy");
  let copyText = document.getElementById('textAreaCF');
  copyText.select();
  navigator.clipboard.writeText(copyText.value);
  
})