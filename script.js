/* =========================================================
   NLP Knowledge Artifact Repository — script.js
   Contains: concept data, card renderer, search, filter,
   theme toggle, mobile nav, scroll spy, workflow tooltips,
   progress bar, back-to-top, quiz logic, glossary search.
   ========================================================= */

/* ---------------------------------------------------------
   1. CONCEPT DATA
   Each concept: category, title, definition, purpose,
   working, example, advantages[], limitations[], applications[]
   --------------------------------------------------------- */
const CONCEPTS = [
  // ---------------- TEXT PREPROCESSING ----------------
  {
    cat: "preprocessing", title: "Sentence Segmentation",
    def: "Splitting a block of raw text into individual sentences.",
    purpose: "Most NLP tasks (translation, summarization, parsing) operate one sentence at a time, so text must be divided before further processing.",
    working: "The system looks for sentence-ending punctuation (., !, ?) while handling exceptions such as abbreviations (Dr., e.g.), decimal numbers, and quotation marks, often using rule-based patterns or trained models.",
    example: 'Input: "Dr. Rao teaches NLP. It is a core AI course."\nOutput: ["Dr. Rao teaches NLP.", "It is a core AI course."]',
    advantages: ["Enables sentence-level processing", "Improves accuracy of downstream tasks", "Simple to implement for most languages"],
    limitations: ["Struggles with abbreviations and informal text", "Errors on missing/irregular punctuation", "Language-specific rules needed"],
    applications: ["Machine translation", "Text summarization", "Speech synthesis"]
  },
  {
    cat: "preprocessing", title: "Tokenization",
    def: "Breaking text into smaller units called tokens — usually words, sub-words, or punctuation marks.",
    purpose: "Computers cannot process raw strings meaningfully; tokens act as the basic building blocks for every later NLP step.",
    working: "A tokenizer scans the text and splits it at whitespace and punctuation boundaries (or, for sub-word tokenizers, at statistically learned merge points), producing a list of discrete tokens.",
    example: 'Input: "I love Natural Language Processing."\nOutput: ["I", "love", "Natural", "Language", "Processing", "."]',
    advantages: ["Foundational step for almost all NLP pipelines", "Enables counting, indexing, and vectorization", "Works across most languages with adaptation"],
    limitations: ["Ambiguous for languages without clear word boundaries (e.g. Chinese)", "Contractions and hyphenated words can split incorrectly", "Sub-word tokenizers add complexity"],
    applications: ["Search engines", "Chatbots", "Feature engineering pipelines"]
  },
  {
    cat: "preprocessing", title: "Case Normalization",
    def: "Converting all characters in the text to a single consistent case, typically lowercase.",
    purpose: "Prevents the model from treating differently-cased forms of the same word (e.g. 'NLP' and 'nlp') as distinct tokens.",
    working: "Every alphabetic character in the token stream is mapped to its lowercase (or uppercase) equivalent using standard string operations.",
    example: 'Input: "Natural Language Processing IS Fun"\nOutput: "natural language processing is fun"',
    advantages: ["Reduces vocabulary size", "Improves matching and retrieval consistency", "Very fast, low computational cost"],
    limitations: ["Loses information (e.g. proper nouns, acronyms)", "Can hurt tasks like Named Entity Recognition", "Not always suitable for case-sensitive tasks"],
    applications: ["Search engines", "Text classification", "Information retrieval"]
  },
  {
    cat: "preprocessing", title: "Stop-word Removal",
    def: "Removing very common words (like 'the', 'is', 'a') that carry little unique meaning for many tasks.",
    purpose: "Reduces noise and dimensionality so models focus on words that actually carry topical or semantic information.",
    working: "Each token is checked against a predefined stop-word list for the language; matching tokens are discarded from the text.",
    example: 'Input: ["I", "love", "Natural", "Language", "Processing"]\nOutput: ["love", "Natural", "Language", "Processing"]',
    advantages: ["Shrinks vocabulary and speeds up processing", "Improves signal-to-noise ratio for keyword tasks", "Simple, low-cost step"],
    limitations: ["Can remove words needed for meaning (e.g. negation: 'not')", "Stop-word lists are language and domain specific", "Not ideal for tasks needing full grammar, like translation"],
    applications: ["Search engines", "Topic modeling", "Text classification"]
  },
  {
    cat: "preprocessing", title: "Stemming",
    def: "Reducing a word to its root/stem form by chopping off suffixes, using simple rule-based heuristics.",
    purpose: "Groups different inflected forms of a word (e.g. 'playing', 'played', 'plays') under one approximate root so they are treated as the same feature.",
    working: "Algorithms such as the Porter Stemmer apply a sequence of suffix-stripping rules (e.g. remove '-ing', '-ed', '-es') without checking whether the result is a real dictionary word.",
    example: 'Input: "studies", "studying", "studied"\nOutput: "studi", "study", "studi"',
    advantages: ["Fast and computationally cheap", "Reduces vocabulary size effectively", "Language-independent rule design possible"],
    limitations: ["Often produces non-words ('studi')", "Can over-stem or under-stem incorrectly", "Ignores grammatical context"],
    applications: ["Search engines", "Information retrieval", "Large-scale text mining"]
  },
  {
    cat: "preprocessing", title: "Lemmatization",
    def: "Reducing a word to its dictionary base form (lemma) using vocabulary and grammatical analysis.",
    purpose: "Provides a linguistically accurate root form so that meaning is preserved better than simple stemming.",
    working: "The system uses a morphological dictionary and part-of-speech information to map inflected words to their correct base form (e.g. 'better' → 'good').",
    example: 'Input: "studies", "studying", "studied"\nOutput: "study", "study", "study"',
    advantages: ["Produces real, meaningful words", "More accurate than stemming", "Preserves semantic meaning better"],
    limitations: ["Slower and computationally heavier than stemming", "Requires POS tagging and dictionaries", "Language resources may be limited for low-resource languages"],
    applications: ["Chatbots", "Machine translation", "Question answering systems"]
  },
  {
    cat: "preprocessing", title: "Noise Removal",
    def: "Eliminating irrelevant elements such as HTML tags, special characters, URLs, or emojis from raw text.",
    purpose: "Real-world text (scraped from the web or social media) contains formatting artifacts that do not carry linguistic meaning and can confuse models.",
    working: "Pattern-matching techniques such as regular expressions detect and strip out tags, URLs, extra whitespace, and non-textual symbols.",
    example: 'Input: "Check this out!! <b>Amazing</b> https://example.com 😀"\nOutput: "Check this out Amazing"',
    advantages: ["Produces cleaner input for models", "Reduces irrelevant vocabulary", "Improves downstream accuracy"],
    limitations: ["Risk of removing meaningful symbols (e.g. emojis in sentiment analysis)", "Rules must be tailored per data source", "May require iterative refinement"],
    applications: ["Social media analytics", "Sentiment analysis", "Web-scraped data pipelines"]
  },
  {
    cat: "preprocessing", title: "Text Cleaning",
    def: "A broader preprocessing step that combines correction and standardization tasks such as spelling fixes, whitespace normalization, and encoding fixes.",
    purpose: "Ensures the text entering the pipeline is consistent, well-formed, and free of technical errors before tokenization and feature extraction.",
    working: "Combines multiple sub-steps — trimming whitespace, fixing encoding issues, expanding contractions, correcting common typos — often using rule-based or dictionary-based methods.",
    example: 'Input: "I  cant belive   its   already 2026"\nOutput: "I cannot believe it is already 2026"',
    advantages: ["Improves overall data quality", "Reduces downstream errors", "Standardizes inconsistent user-generated text"],
    limitations: ["Can be time-consuming to design rules for", "Automated spelling correction can introduce new errors", "Not fully language-independent"],
    applications: ["Chatbots", "Customer feedback analysis", "Data preprocessing pipelines"]
  },

  // ---------------- FEATURE ENGINEERING ----------------
  {
    cat: "feature", title: "Bag of Words",
    def: "A representation that describes a document by the frequency of each word in it, ignoring grammar and word order.",
    purpose: "Converts variable-length text into a fixed-length numerical vector that machine learning models can process.",
    working: "A vocabulary is built from all unique words in the corpus; each document is represented as a vector of word counts against that vocabulary.",
    example: 'Docs: "I love NLP", "I love AI"\nVocabulary: [I, love, NLP, AI]\nDoc1 vector: [1,1,1,0]',
    advantages: ["Simple and easy to implement", "Works reasonably well for many classification tasks", "Computationally efficient for small vocabularies"],
    limitations: ["Ignores word order and context", "Produces very sparse, high-dimensional vectors", "Cannot capture semantic similarity between words"],
    applications: ["Spam detection", "Text classification", "Document similarity"]
  },
  {
    cat: "feature", title: "N-Grams",
    def: "Contiguous sequences of N words (or characters) taken from a text, used to capture local word order.",
    purpose: "Bag of Words loses word order; n-grams partially recover context by treating short word sequences as single features.",
    working: "A sliding window of size N moves across the token sequence, extracting overlapping groups of N consecutive tokens as features.",
    example: 'Input: "I love NLP"\nBigrams (N=2): ["I love", "love NLP"]',
    advantages: ["Captures some local word order and context", "Improves performance over plain Bag of Words", "Flexible — N can be tuned to the task"],
    limitations: ["Vocabulary size grows rapidly with N", "Still cannot capture long-range dependencies", "Increases sparsity and memory usage"],
    applications: ["Language modeling", "Autocomplete/predictive text", "Spelling and grammar correction"]
  },
  {
    cat: "feature", title: "Term Frequency (TF)",
    def: "A measure of how often a term appears in a document, relative to the total number of terms in that document.",
    purpose: "Highlights words that occur frequently within a specific document, which often signals relevance to that document's topic.",
    working: "Computed as: TF(t,d) = (number of times term t appears in document d) / (total number of terms in document d).",
    example: 'Document: "NLP is fun. NLP is powerful."\nTF("NLP") = 2/6 = 0.33',
    advantages: ["Simple to compute", "Reflects word importance within a single document", "Forms the foundation for TF-IDF"],
    limitations: ["Common words can dominate scores unfairly", "Does not consider importance across the whole corpus", "Sensitive to document length"],
    applications: ["Information retrieval", "Keyword extraction", "Search ranking (as a component of TF-IDF)"]
  },
  {
    cat: "feature", title: "Inverse Document Frequency (IDF)",
    def: "A measure of how rare or common a term is across an entire corpus of documents.",
    purpose: "Down-weights terms that appear in many documents (like common words) and up-weights terms that are distinctive to fewer documents.",
    working: "Computed as: IDF(t) = log( total number of documents / number of documents containing term t ).",
    example: '10 documents total; "NLP" appears in 2 of them\nIDF("NLP") = log(10/2) = log(5) ≈ 1.61',
    advantages: ["Reduces the weight of very common, low-information words", "Highlights terms unique to specific documents", "Corpus-aware, unlike TF alone"],
    limitations: ["Requires access to the full corpus in advance", "Can be unstable for very small corpora", "Does not consider term position or context"],
    applications: ["Search engines", "Document ranking", "Keyword/topic extraction"]
  },
  {
    cat: "feature", title: "TF-IDF",
    def: "A combined score (Term Frequency × Inverse Document Frequency) that measures how important a word is to a document relative to a whole corpus.",
    purpose: "Balances local frequency (TF) with corpus-wide rarity (IDF) so common words are down-weighted and distinctive words stand out.",
    working: "TF-IDF(t,d) = TF(t,d) × IDF(t). A word gets a high score when it appears often in one document but rarely across the rest of the corpus.",
    example: 'TF("NLP") = 0.33, IDF("NLP") = 1.61\nTF-IDF("NLP") = 0.33 × 1.61 ≈ 0.53',
    advantages: ["Better than raw counts at surfacing meaningful words", "Widely used, simple to compute, no training needed", "Effective baseline for many text tasks"],
    limitations: ["Still ignores word order and semantics", "Produces sparse, high-dimensional vectors", "Cannot capture synonyms or context"],
    applications: ["Search engines", "Document clustering", "Keyword extraction"]
  },

  // ---------------- LANGUAGE REPRESENTATION ----------------
  {
    cat: "representation", title: "One-Hot Encoding",
    def: "Representing each word as a binary vector with a single '1' at the word's index in the vocabulary and '0' everywhere else.",
    purpose: "Provides the most basic way to convert categorical word identity into a numerical format a model can read.",
    working: "A vocabulary of size V is built; each word is represented as a V-dimensional vector that is all zeros except a single 1 at that word's unique position.",
    example: 'Vocabulary: [cat, dog, fish] (size 3)\n"dog" → [0, 1, 0]',
    advantages: ["Extremely simple and intuitive", "No training required", "Easy to implement"],
    limitations: ["Vectors become huge and sparse for large vocabularies", "No notion of similarity between words (cat and dog are equally 'different')", "Cannot generalize to unseen words"],
    applications: ["Small-vocabulary classification tasks", "Categorical feature encoding", "Baseline NLP pipelines"]
  },
  {
    cat: "representation", title: "Word Embeddings",
    def: "Dense, low-dimensional vector representations of words where semantically similar words are located close together in vector space.",
    purpose: "Overcomes the sparsity and lack of meaning in one-hot vectors by letting numerical distance reflect semantic similarity.",
    working: "A model is trained on large text corpora so that words appearing in similar contexts are pushed to similar vector positions, typically producing 50–300 dimensional dense vectors.",
    example: 'One-hot "king": [0,0,1,0,...,0] (sparse, size = vocabulary)\nEmbedding "king": [0.21, -0.45, 0.88, ...] (dense, size ≈ 100–300)',
    advantages: ["Captures semantic relationships between words", "Compact, dense representation", "Transferable — pre-trained embeddings can be reused"],
    limitations: ["Requires large training corpora", "A single word gets one fixed vector regardless of context", "Bias present in training data can be encoded into vectors"],
    applications: ["Sentiment analysis", "Machine translation", "Recommendation and similarity systems"]
  },
  {
    cat: "representation", title: "Word2Vec",
    def: "A neural embedding technique that learns word vectors by predicting a word from its context (CBOW) or context from a word (Skip-gram).",
    purpose: "Efficiently produces high-quality dense word embeddings by training a shallow neural network on large amounts of unlabeled text.",
    working: "A shallow neural network is trained with either the CBOW objective (predict target word from surrounding context) or the Skip-gram objective (predict surrounding context from a target word); the learned hidden-layer weights become the word vectors.",
    example: 'Trained relationship: vector("king") - vector("man") + vector("woman") ≈ vector("queen")',
    advantages: ["Captures analogical and semantic relationships well", "Efficient to train on large corpora", "Produces reusable pre-trained vectors"],
    limitations: ["Treats each word as a whole unit — cannot handle out-of-vocabulary words", "One fixed vector per word regardless of context", "Struggles with rare words and morphology"],
    applications: ["Semantic search", "Recommendation systems", "Feature input for downstream classifiers"]
  },
  {
    cat: "representation", title: "FastText",
    def: "An extension of Word2Vec developed by Facebook AI that represents words as bags of character n-grams rather than whole-word units.",
    purpose: "Solves Word2Vec's out-of-vocabulary problem and better handles morphologically rich languages by learning sub-word information.",
    working: "Each word is broken into overlapping character n-grams (e.g. 'where' → 'wh','whe','her','ere','re'); the word's embedding is the sum of its n-gram vectors, so even unseen words can be approximated from their sub-parts.",
    example: '"unhappiness" can be embedded even if unseen, by combining vectors for "un", "happi", "ness"',
    advantages: ["Handles out-of-vocabulary and rare words well", "Captures morphology (prefixes/suffixes)", "Effective for morphologically rich languages"],
    limitations: ["Larger model size due to n-gram storage", "Slightly slower to train than Word2Vec", "Still produces one static vector per word, not context-aware"],
    applications: ["Multilingual and regional-language NLP", "Text classification with informal/misspelled text", "Search and autocomplete"]
  },
  {
    cat: "representation", title: "Contextual Embeddings",
    def: "Word representations that change dynamically depending on the surrounding sentence, rather than being fixed per word.",
    purpose: "Solves the core limitation of Word2Vec/FastText: the same word can mean different things in different contexts (e.g. 'bank' of a river vs. a 'bank' account).",
    working: "Deep models such as Transformer-based encoders process the entire sentence at once, producing a distinct vector for each word occurrence based on its surrounding words.",
    example: '"He sat by the river bank." vs "He deposited money in the bank."\n→ two different vectors for "bank"',
    advantages: ["Captures word sense disambiguation naturally", "State-of-the-art performance on most NLP tasks", "Better handles polysemy (multiple meanings)"],
    limitations: ["Computationally expensive to train and run", "Requires large models and datasets", "Less interpretable than static embeddings"],
    applications: ["Question answering", "Chatbots and virtual assistants", "Machine translation"]
  },

  // ---------------- LANGUAGE MODELS ----------------
  {
    cat: "models", title: "Statistical Language Models",
    def: "Models that predict the probability of a word sequence using statistics such as word co-occurrence counts (e.g. N-gram models).",
    purpose: "Provide an early, mathematically grounded way to estimate how likely a sentence or word sequence is, useful for tasks like speech recognition and text prediction.",
    working: "The model estimates the probability of a word given the previous N-1 words using frequency counts from a training corpus, often with smoothing to handle unseen sequences.",
    example: 'P("processing" | "language") estimated from how often "language processing" appears in the training corpus',
    advantages: ["Simple, interpretable, and fast to train", "Requires no deep learning infrastructure", "Works reasonably for short-range predictions"],
    limitations: ["Cannot capture long-range dependencies", "Suffers from data sparsity for large N", "No real understanding of semantics"],
    applications: ["Early speech recognition systems", "Basic autocomplete", "Spelling correction"]
  },
  {
    cat: "models", title: "Neural Language Models",
    def: "Language models that use neural networks (e.g. RNNs, LSTMs) to learn word probabilities and represent context in continuous vector space.",
    purpose: "Overcome the sparsity and limited context window of statistical models by learning dense representations that generalize better.",
    working: "A recurrent neural network processes a sequence word by word, maintaining a hidden state that carries information from earlier words to predict the next word.",
    example: 'An LSTM reading "The weather in Mumbai is..." maintains context to predict a plausible next word such as "humid"',
    advantages: ["Captures longer context than N-gram models", "Learns dense, generalizable representations", "Better handles unseen word combinations"],
    limitations: ["Sequential processing makes training slower", "Still struggles with very long-range dependencies", "Requires more data and compute than statistical models"],
    applications: ["Text generation", "Machine translation (early neural MT)", "Speech recognition"]
  },
  {
    cat: "models", title: "Transformer-based Representations",
    def: "Language models built on the Transformer architecture, which uses self-attention to weigh the relevance of every word to every other word in a sequence, regardless of distance.",
    purpose: "Solve the long-range dependency and sequential-processing bottlenecks of RNN-based models, enabling large-scale parallel training on massive text corpora.",
    working: "Self-attention layers compute, for each word, how much focus to place on every other word in the sentence simultaneously; multiple such layers are stacked to build deep contextual representations.",
    example: 'In "The trophy did not fit in the suitcase because it was too big," attention helps the model correctly link "it" to "trophy"',
    advantages: ["Captures long-range context very effectively", "Enables parallel training, making large-scale models feasible", "Basis for state-of-the-art models (BERT, GPT family)"],
    limitations: ["Very high computational and memory cost", "Requires massive datasets to train from scratch", "Can be a 'black box' with limited interpretability"],
    applications: ["Chatbots and virtual assistants", "Machine translation", "Text summarization and question answering"]
  }
];

/* ---------------------------------------------------------
   2. CATEGORY METADATA
   --------------------------------------------------------- */
const CATEGORY_LABELS = {
  preprocessing: "Text Preprocessing",
  feature: "Feature Engineering",
  representation: "Language Representation",
  models: "Language Models"
};

let activeCategory = "all";
let activeQuery = "";
let expandedCards = new Set();

/* ---------------------------------------------------------
   3. RENDER CONCEPT CARDS
   --------------------------------------------------------- */
function renderConcepts(){
  const grids = document.querySelectorAll("[data-concept-grid]");
  grids.forEach(grid => {
    const gridCat = grid.getAttribute("data-concept-grid"); // "preprocessing" | "feature" | ... | "all"
    const items = CONCEPTS.filter(c => {
      const matchesGridCat = gridCat === "all" ? true : c.cat === gridCat;
      const matchesFilter = activeCategory === "all" ? true : c.cat === activeCategory;
      const matchesQuery = activeQuery === "" ? true : c.title.toLowerCase().includes(activeQuery);
      return matchesGridCat && matchesFilter && matchesQuery;
    });

    grid.innerHTML = items.map(c => cardHTML(c)).join("");

    const noRes = grid.parentElement.querySelector(".no-results");
    if(noRes) noRes.style.display = items.length === 0 ? "block" : "none";
  });

  // re-attach expand handlers
  document.querySelectorAll(".concept-card .toggle-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const card = btn.closest(".concept-card");
      card.classList.toggle("expanded");
      btn.textContent = card.classList.contains("expanded") ? "Show less −" : "Show details +";
    });
  });
}

function cardHTML(c){
  const id = c.title.replace(/\s+/g,"-").toLowerCase();
  return `
  <article class="concept-card" data-id="${id}" data-cat="${c.cat}">
    <span class="cat-tag">${CATEGORY_LABELS[c.cat]}</span>
    <h3>${c.title}</h3>
    <p class="def">${c.def}</p>
    <p class="purpose"><strong style="color:var(--text-dim)">Why it's needed:</strong> ${c.purpose}</p>
    <button class="toggle-btn" type="button">Show details +</button>
    <div class="details">
      <div class="detail-block">
        <div class="label">Working Principle</div>
        <div class="val">${c.working}</div>
      </div>
      <div class="detail-block">
        <div class="label">Example</div>
        <div class="example-box">${c.example.replace(/\n/g,"<br>")}</div>
      </div>
      <div class="detail-block">
        <div class="label">Advantages</div>
        <ul>${c.advantages.map(a=>`<li>${a}</li>`).join("")}</ul>
      </div>
      <div class="detail-block">
        <div class="label">Limitations</div>
        <ul>${c.limitations.map(a=>`<li>${a}</li>`).join("")}</ul>
      </div>
      <div class="detail-block">
        <div class="label">Applications</div>
        <ul>${c.applications.map(a=>`<li>${a}</li>`).join("")}</ul>
      </div>
    </div>
  </article>`;
}

/* ---------------------------------------------------------
   4. SEARCH + FILTER (global toolbar, on Home/overview use)
   --------------------------------------------------------- */
function initSearchAndFilter(){
  const searchInput = document.getElementById("concept-search");
  if(searchInput){
    searchInput.addEventListener("input", (e)=>{
      activeQuery = e.target.value.trim().toLowerCase();
      renderConcepts();
    });
  }

  document.querySelectorAll(".pill[data-filter]").forEach(pill=>{
    pill.addEventListener("click", ()=>{
      document.querySelectorAll(".pill[data-filter]").forEach(p=>p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.getAttribute("data-filter");
      renderConcepts();
    });
  });
}

/* ---------------------------------------------------------
   5. THEME TOGGLE (persisted via localStorage)
   --------------------------------------------------------- */
function initTheme(){
  const root = document.documentElement;
  const stored = localStorage.getItem("nlp-repo-theme");
  if(stored){ root.setAttribute("data-theme", stored); }

  document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
    updateThemeBtnLabel(btn, root.getAttribute("data-theme"));
    btn.addEventListener("click", ()=>{
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      if(next === "dark"){ root.removeAttribute("data-theme"); } else { root.setAttribute("data-theme","light"); }
      localStorage.setItem("nlp-repo-theme", next);
      document.querySelectorAll("[data-theme-toggle]").forEach(b=>updateThemeBtnLabel(b, next));
    });
  });
}
function updateThemeBtnLabel(btn, mode){
  btn.innerHTML = mode === "light" ? "🌙 Dark mode" : "☀️ Light mode";
}

/* ---------------------------------------------------------
   6. MOBILE NAV (hamburger)
   --------------------------------------------------------- */
function initMobileNav(){
  const toggle = document.getElementById("hamburger-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if(!toggle) return;
  const close = ()=>{ sidebar.classList.remove("open"); overlay.classList.remove("show"); };
  toggle.addEventListener("click", ()=>{
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });
  overlay.addEventListener("click", close);
  sidebar.querySelectorAll(".nav-link").forEach(link=>link.addEventListener("click", close));
}

/* ---------------------------------------------------------
   7. SCROLL SPY — highlight active nav link
   --------------------------------------------------------- */
function initScrollSpy(){
  const sections = document.querySelectorAll("main .section[id]");
  const links = document.querySelectorAll(".nav-link[href^='#']");
  const map = {};
  links.forEach(l => map[l.getAttribute("href").slice(1)] = l);

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const link = map[entry.target.id];
      if(!link) return;
      if(entry.isIntersecting){
        links.forEach(l=>l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });

  sections.forEach(s=>observer.observe(s));
}

/* ---------------------------------------------------------
   8. PROGRESS BAR + BACK TO TOP
   --------------------------------------------------------- */
function initProgressAndTop(){
  const bar = document.getElementById("progress-bar");
  const topBtn = document.getElementById("back-to-top");
  window.addEventListener("scroll", ()=>{
    const scrolled = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = height > 0 ? (scrolled/height)*100 : 0;
    if(bar) bar.style.width = pct + "%";
    if(topBtn) topBtn.classList.toggle("show", scrolled > 600);
  });
  if(topBtn){
    topBtn.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));
  }
}

/* ---------------------------------------------------------
   9. TOKEN STREAM HERO ANIMATION
   --------------------------------------------------------- */
function initTokenStream(){
  const row = document.getElementById("token-row");
  if(!row) return;
  const tokens = ["I", "love", "Natural", "Language", "Processing", "."];
  row.innerHTML = tokens.map((t,i)=>`<span class="tok" style="animation-delay:${i*0.12+0.2}s">${t}</span>`).join("");
}

/* ---------------------------------------------------------
   10. GLOSSARY SEARCH
   --------------------------------------------------------- */
function initGlossarySearch(){
  const input = document.getElementById("glossary-search");
  if(!input) return;
  input.addEventListener("input", ()=>{
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll(".gterm").forEach(term=>{
      const text = term.textContent.toLowerCase();
      term.style.display = text.includes(q) ? "" : "none";
    });
  });
}

/* ---------------------------------------------------------
   11. QUIZ
   --------------------------------------------------------- */
const QUIZ = [
  { q: "What is the correct order of a basic text preprocessing pipeline?", opts: ["Tokenization → Segmentation → Stemming", "Sentence Segmentation → Tokenization → Normalization", "Stop-word Removal → Tokenization → Segmentation", "Lemmatization → Segmentation → Cleaning"], correct: 1 },
  { q: "Which technique produces real dictionary words, unlike simple suffix-stripping?", opts: ["Stemming", "Lemmatization", "Tokenization", "Noise Removal"], correct: 1 },
  { q: "TF-IDF is calculated as:", opts: ["TF + IDF", "TF ÷ IDF", "TF × IDF", "IDF − TF"], correct: 2 },
  { q: "What is the main limitation of Bag of Words?", opts: ["It cannot run on large corpora", "It ignores word order and context", "It requires labeled data", "It only works for English"], correct: 1 },
  { q: "Which representation gives a word a single fixed vector regardless of sentence context?", opts: ["Contextual Embeddings", "Word2Vec", "Transformer output", "BERT embeddings"], correct: 1 },
  { q: "FastText improves on Word2Vec mainly by:", opts: ["Using one-hot vectors", "Representing words using character n-grams", "Removing stop words automatically", "Requiring no training data"], correct: 1 },
  { q: "Which architecture introduced self-attention as its core mechanism?", opts: ["Statistical N-gram models", "Recurrent Neural Networks", "Transformers", "Bag of Words"], correct: 2 },
  { q: "IDF gives a higher score to words that are:", opts: ["Very frequent across all documents", "Rare across the document corpus", "Always at the start of a sentence", "Removed during stop-word removal"], correct: 1 },
  { q: "Contextual embeddings solve which core problem?", opts: ["Slow tokenization speed", "A word having the same vector regardless of meaning in context", "Missing punctuation in raw text", "Large file sizes of raw text"], correct: 1 },
  { q: "Which of these is NOT one of the five required real-world applications covered in this repository?", opts: ["Search Engines", "Machine Translation", "Video Game Rendering", "Sentiment Analysis"], correct: 2 }
];

function renderQuiz(){
  const box = document.getElementById("quiz-questions");
  if(!box) return;
  box.innerHTML = QUIZ.map((item, qi)=>`
    <div class="quiz-q" data-qi="${qi}">
      <p class="qtext">${qi+1}. ${item.q}</p>
      <div class="quiz-opts">
        ${item.opts.map((opt,oi)=>`
          <label class="quiz-opt">
            <input type="radio" name="q${qi}" value="${oi}">
            <span>${opt}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function initQuizSubmit(){
  const btn = document.getElementById("quiz-submit");
  const result = document.getElementById("quiz-result");
  if(!btn) return;
  btn.addEventListener("click", ()=>{
    let score = 0;
    QUIZ.forEach((item, qi)=>{
      const chosen = document.querySelector(`input[name="q${qi}"]:checked`);
      if(chosen && parseInt(chosen.value,10) === item.correct) score++;
    });
    result.style.display = "block";
    result.querySelector(".score").textContent = `${score} / ${QUIZ.length}`;
    let msg = "Good effort — revisit the concept cards above for the ones you missed.";
    if(score === QUIZ.length) msg = "Perfect score! You've got a solid grasp of Week 1 NLP concepts.";
    else if(score >= QUIZ.length - 2) msg = "Great work! Just a couple to review.";
    result.querySelector(".msg").textContent = msg;
    result.scrollIntoView({ behavior:"smooth", block:"center" });
  });
}

/* ---------------------------------------------------------
   12. INIT
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  renderConcepts();
  initSearchAndFilter();
  initTheme();
  initMobileNav();
  initScrollSpy();
  initProgressAndTop();
  initTokenStream();
  initGlossarySearch();
  renderQuiz();
  initQuizSubmit();

  document.querySelectorAll("[data-scroll-to]").forEach(el=>{
    el.addEventListener("click", (e)=>{
      e.preventDefault();
      const target = document.querySelector(el.getAttribute("data-scroll-to"));
      if(target) target.scrollIntoView({ behavior:"smooth" });
    });
  });
});
