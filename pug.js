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
        "slug": "freebitcoin_autoclick",
        "theme": "freebitcoin",
    
        "meta_description": "Automate freebitco.in earnings with Autoroll Autoclick script. Boost Bitcoin profits effortlessly. Skip CAPTCHA hassle. Install with Tampermonkey. Start now!",
        "meta_keywords": "freebitco.in, Autoroll Autoclick script, automate earnings, Bitcoin, cryptocurrency, Tampermonkey, skip CAPTCHA",
        "meta_title": "Automate Bitcoin Earnings with freebitco.in Autoroll Autoclick Script | Boost Your Profits Effortlessly",
    
        "title": "freebitco.in Autoroll Autoclick Script"
    },
    {
        "slug": "freebitcoin_multiply_btc_roll_counter",
        "theme": "freebitcoin",
    
        "meta_description": "Track and analyze roll statistics in freebitco.in's Multiply BTC game with the freebitco.in Multiply BTC Roll Counter. Get valuable insights on the number of rolls since the last winning number and optimize your strategy.",
        "meta_keywords": "freebitco.in, Multiply BTC, roll counter, roll statistics, strategy, gambling",
        "meta_title": "Freebitco.in Multiply BTC Roll Counter | Track and Analyze Roll Statistics",
    
        "title": "freebitco.in Multiply BTC Roll Counter Script"
    },
];

for(let i=0; i<pages.length; i++){
    // Compile template.pug, and render a set of data
    content = pug.renderFile('src/templates/'+pages[i]['slug']+'.pug', {
        pages,
        index: i
    });

    fs.writeFile(pages[i]['slug']+'.html', content, function(){});
}

