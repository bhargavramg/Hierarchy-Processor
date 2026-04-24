import React from 'react';

export default function JsonView({ data }) {
  const jsonStr = JSON.stringify(data, null, 2);
  
  // A simple regex-based highligher for JSON
  const highlight = (json) => {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'json-n'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-k'; // key
        } else {
          cls = 'json-s'; // string
        }
      } else if (/true|false|null/.test(match)) {
        cls = 'json-b'; // boolean
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  };

  return (
    <pre 
      className="json-block"
      data-testid="raw-response-json"
      dangerouslySetInnerHTML={{ __html: highlight(jsonStr) }}
    />
  );
}
