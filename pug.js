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
];

for(let i=0; i<pages.length; i++){
    // Compile template.pug, and render a set of data
    content = pug.renderFile('src/templates/'+pages[i]['slug']+'.pug', {
        pages,
        index: i
    });

    fs.writeFile(pages[i]['slug']+'.html', content, function(){});
}

