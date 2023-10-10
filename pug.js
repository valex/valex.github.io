const fs = require('fs');
const pug = require('pug');

let content;

const pages = [
    {
        "slug": "vector_addition",
        "theme": "vectors",
    
        "meta_description": "Vector addition",
        "meta_keywords": "vector, vectors, add, addition, adding, animation, interactive",
        "meta_title": "Vector addition - Interactive Animation",
    
        "title": "Vector addition"
    },
    {
        "slug": "vector_subtraction",
        "theme": "vectors",
    
        "meta_description": "Vector subtraction",
        "meta_keywords": "vector, vectors, sub, subtraction, animation, interactive",
        "meta_title": "Vector subtraction - Interactive Animation",
    
        "title": "Vector subtraction"
    },
    {
        "slug": "vector_length",
        "theme": "vectors",
    
        "meta_description": "Vector length or vector magnitude. How to calculate vector length and interactive animation.",
        "meta_keywords": "vector, vectors, length, magnitude, norm, formula, animation, interactive",
        "meta_title": "Vector length, magnitude - Interactive Animation",
    
        "title": "Vector length or magnitude"
    },
    {
        "slug": "unit_vector",
        "theme": "vectors",
    
        "meta_description": "Unit vector is a vector of length 1 (one)",
        "meta_keywords": "vector, vectors, length, unit, normalized",
        "meta_title": "Unit vector - Interactive Animation",
    
        "title": "Unit vector"
    },
    {
        "slug": "cross_product",
        "theme": "vectors",
    
        "meta_description": "Explore the concept of cross product in 3D vectors through an interactive animation. Understand how it produces a new vector perpendicular to the multiplied vectors, with trigonometric significance and the right-hand rule.",
        "meta_keywords": "cross product, vector product, 3D vectors, interactive animation, perpendicular vectors, trigonometric significance, right-hand rule",
        "meta_title": "Cross product | 3D interactive animation",
    
        "title": "Cross product"
    },
    {
        "slug": "dom",
        "theme": "javascript",
    
        "meta_description": "Discover the power of the Document Object Model (DOM) and how it enables dynamic, interactive web experiences. Learn about the fundamental concepts of DOM, including elements, nodes, and attributes, and explore how JavaScript can be used to manipulate them. With practical examples and step-by-step instructions, this comprehensive guide will help you master DOM and take your web development skills to the next level.",
        "meta_keywords": "DOM manipulation, JavaScript DOM, HTML elements, web development, front-end development, nodes, attributes",
        "meta_title": "DOM - Document Object Model. DOM Manipulation Methods in JavaScript",
    
        "title": "DOM - Document Object Model"
    },
    {
        "slug": "script_tag",
        "theme": "javascript",
    
        "meta_description": "Learn how to effectively include JavaScript in your web pages using the script-tag and understand the benefits of dynamically loading scripts. Explore techniques such as direct embedding and external file inclusion, along with the 'defer' and 'async' attributes. Discover the use of the link rel='subresource' tag to optimize resource loading, improve performance, and enhance the browsing experience.",
        "meta_keywords": "JavaScript inclusion, script tag, direct embedding, external file inclusion, 'defer' attribute, 'async' attribute, dynamic script loading, resource optimization, performance enhancement, 'subresource' tag, web development, front-end programming.",
        "meta_title": "Understanding JavaScript Inclusion in HTML: Embedding Scripts, External Files, and Key Considerations",
    
        "title": "Inserting JavaScript into an HTML page"
    },
    {
        "slug": "variables_in_js",
        "theme": "javascript",
    
        "meta_description": "Learn about JavaScript variables and their types: var, let, and const. Understand variable scoping, initialization, and best practices for improved code quality. Discover how to declare variables, handle global and block scopes, and ensure immutability with const.",
        "meta_keywords": "JavaScript variables, var, let, const, variable scoping, variable types, variable declaration, global scope, block scope, const correctness, variable immutability, code quality",
        "meta_title": "JavaScript Variables: Understanding var, let, and const | Complete Guide and Best Practices",
    
        "title": "Variables in JavaScript"
    },
    {
        "slug": "freebitcoin_autoclick",
        "theme": "freebitcoin",
    
        "meta_description": "Automate freebitco.in earnings with Autoroll Autoclick script. Boost Bitcoin profits effortlessly. Skip CAPTCHA hassle. Install with Tampermonkey. Start now!",
        "meta_keywords": "freebitco.in, Autoroll Autoclick script, automate earnings, Bitcoin, cryptocurrency, Tampermonkey, skip CAPTCHA",
        "meta_title": "Automate Bitcoin Earnings with freebitco.in Autoroll Autoclick Script | Boost Your Profits Effortlessly",
    
        "title": "freebitco.in Autoroll Autoclick Script",
        "alternates": {
            "de": {
                "meta_description": "Automatisieren Sie Ihre freebitco.in-Einnahmen mit dem Autoroll Autoclick-Skript. Steigern Sie Ihre Bitcoin-Gewinne mühelos. Überspringen Sie das CAPTCHA-Ärgernis. Installieren Sie es mit Tampermonkey. Legen Sie jetzt los!",
                "meta_keywords": "freebitco.in, Autoroll Autoklick-Skript, Automatisierung von Einnahmen, Bitcoin, Kryptowährung, Tampermonkey, CAPTCHA überspringen",
                "meta_title": "Automatisieren Sie Ihre Bitcoin-Einnahmen mit dem freebitco.in Autoroll Autoklick-Skript | Steigern Sie Ihre Gewinne mühelos",
            
                "title": "freebitco.in Autoroll Autoklick-Skript",
            }
        }
    },
    {
        "slug": "freebitcoin_multiply_btc_roll_counter",
        "theme": "freebitcoin",
    
        "meta_description": "Track and analyze roll statistics in freebitco.in's Multiply BTC game with the freebitco.in Multiply BTC Roll Counter. Get valuable insights on the number of rolls since the last winning number and optimize your strategy",
        "meta_keywords": "freebitco.in, Multiply BTC, roll counter, roll statistics, strategy, gambling",
        "meta_title": "Freebitco.in Multiply BTC Roll Counter | Track and Analyze Roll Statistics",
    
        "title": "freebitco.in Multiply BTC Roll Counter Script",
        "alternates": {
            "de": {
                "meta_description": "Verfolgen und analysieren Sie Rollstatistiken im 'Multiply BTC'-Spiel von freebitco.in mit dem freebitco.in Multiply BTC Roll Counter. Erhalten Sie wertvolle Einblicke in die Anzahl der Rollen seit der letzten Gewinnzahl und optimieren Sie Ihre Strategie",
                "meta_keywords": "freebitco.in, Multiply BTC, Rollenzähler, Rollstatistiken, Strategie, Glücksspiel",
                "meta_title": "Freebitco.in Multiply BTC Rollenzähler | Verfolgen und Analysieren von Rollstatistiken",
            
                "title": "freebitco.in Multiply BTC Rollenzähler Skript",
            }
        }
    },
    {
        "slug": "numbers_in_js",
        "theme": "javascript",
    
        "meta_description": "Learn about the different types of numbers in JavaScript, including integers, floating-point numbers, NaN, and Infinity. Understand how to handle conversions and avoid common pitfalls with Number, parseInt, and parseFloat functions. Get insights into the complexities of JavaScript numbers and improve your coding precision.",
        "meta_keywords": "JavaScript numbers, integers, floating-point numbers, NaN, Infinity, Number, parseInt, parseFloat, conversions, coding precision, JavaScript data types.",
        "meta_title": "JavaScript Numbers: Integers, Floating-Point, NaN, and Infinity Explained",
    
        "title": "Numbers in JavaScript"
    },
    {
        "slug": "strings_in_js",
        "theme": "javascript",
    
        "meta_description": "Explore the world of JavaScript strings in this comprehensive guide! Learn how to create, manipulate, and interpolate strings with ease. Discover the power of template literals and raw strings for better code efficiency.",
        "meta_keywords": "JavaScript strings, String data type, character literals, template literals, raw strings, string manipulation, interpolation, JavaScript guide, web development, programming, JavaScript syntax",
        "meta_title": "Mastering JavaScript Strings: A Comprehensive Guide to Using and Manipulating Strings in JavaScript | Learn JavaScript Strings, Template Literals, and Raw Strings",
    
        "title": "Strings in JavaScript"
    },
    {
        "slug": "virtual_environment",
        "theme": "python",
    
        "meta_description": "Learn about Python virtual environments, how to create them for project isolation, and manage dependencies using the requirements.txt file. Keep your projects up-to-date and conflict-free with virtual environments, ensuring reliable operations",
        "meta_keywords": "Python, virtual environment, venv, project isolation, dependencies, requirements.txt, package management, Python projects, version conflicts, dependency management, collaboration",
        "meta_title": "Python Virtual Environments: Isolate Projects & Manage Dependencies",
    
        "title": "Python virtual environments",
        "alternates": {
            "de": {
                "meta_description": "Erfahren Sie mehr über Python-Virtualumgebungen, wie Sie sie zur Projektabgrenzung erstellen und Abhängigkeiten mithilfe der requirements.txt-Datei verwalten können. Halten Sie Ihre Projekte mit virtuellen Umgebungen auf dem neuesten Stand und frei von Konflikten, um eine zuverlässige Funktionsweise sicherzustellen",
                "meta_keywords": "Python, virtuelle Umgebung, venv, Projektabgrenzung, Abhängigkeiten, requirements.txt, Paketverwaltung, Python-Projekte, Versionskonflikte, Abhängigkeitsverwaltung, Zusammenarbeit",
                "meta_title": "Python Virtuelle Umgebungen: Projekte isolieren und Abhängigkeiten verwalten",
            
                "title": "Python Virtualumgebungen",
            }
        }
    },
];

const alternatePages = {
    "de": []
};



for(let i=0; i<pages.length; i++){

    // Compile template.pug, and render a set of data
    content = pug.renderFile('src/templates/'+pages[i]['slug']+'.pug', {
        pages,
        index: i
    });

    fs.writeFile(pages[i]['slug']+'.html', content, function(){});

    if( pages[i].hasOwnProperty('alternates')){
        for (let alternate in pages[i]['alternates']) {
            alternatePages[alternate].push( Object.assign({
                "slug": pages[i]['slug'],
                "theme": pages[i]['theme'],
            }, pages[i]['alternates'][alternate]) );
        }
    }
}

for(let i=0; i<alternatePages['de'].length; i++){
    const alternate = 'de';
    // Compile template.pug, and render a set of data
    content = pug.renderFile('src/templates/'+alternate+'/'+alternatePages[alternate][i]['slug']+'.pug', {
        pages: alternatePages[alternate],
        index: i
    });
    
    fs.writeFile(alternate+'/'+alternatePages[alternate][i]['slug']+'.html', content, function(){});
}


