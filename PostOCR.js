const PostOCR = module.exports;

// modules
const { Language } = require('node-nlp');
const { NerManager } = require('node-nlp');

const supportedLanguages = ['fr', 'en'];

PostOCR.runTasks = function(pages) {

    // Keep the bloc for the lang detection
    let bloc = PostOCR.joinWords(pages);

    // split pages, create structure
    let finalPages = PostOCR.split_parag(pages);
    
    // detect language
    let langDet = PostOCR.lang_detect(bloc);
    let lang = langDet ? langDet.alpha2 : null;

    // flattern
    let flatPages = PostOCR.flattern(finalPages);

    return {
        parags: flatPages,
        lang: lang,
        pagesCount: pages.length
    }
}

PostOCR.split_parag = function(pages) {
    let out = [];
    pages.forEach(p => {
        let parags = p.split("\n\n")
            .map(pg => pg.replace(/\r?\n/g, " ")
                //.replace(/[^\w\s]/gi, '')
                .trim())
            .filter(p => p.length);
        out.push(parags.map(pg => {
            return {
                real_text: pg,
                clean_text: null
            }
        }));
    });
    return out.filter(o => o.length);
}

PostOCR.lang_detect = function(bloc) {
    const language = new Language();
    const guess = language.guess(bloc);
    const res = supportedLanguages.map(s => guess.find(g => g.alpha2 === s));
    let max = 0;
    let decision = null;
    res.forEach(r => {
        if (r && r.score > max) {
            max = r.score;
            decision = r;
        }
    });
    return decision;
}

PostOCR.searchNER = function(bloc, lang) {
    return new Promise(async (resolve, reject) => {
        const manager = new NerManager({ threshold: 0.8 });
        let entities = await manager.findEntities(bloc, lang);
        resolve(entities);
    });
}

PostOCR.joinWords = function(words) {
    return words.join(" ");
}

PostOCR.flattern = function(pages) {
    let out = [];
    pages.forEach((p, pi) => {
        p.forEach(pg => {
            out.push({
                ...pg,
                pages: pi + 1
            })
        });
    });
    return out;
}
