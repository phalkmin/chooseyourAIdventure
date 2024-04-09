import React from "react";

const Layout: React.FC = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Interactive Story and Image Generator</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body className="bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-600">
          Interactive Story and Image Generator
        </h1>

        <div id="generator" className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Generate Story and Image
          </h2>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:items-center">
            <input
              type="text"
              id="input-prompt"
              placeholder="Enter a prompt for the story and image"
              className="flex-1 px-4 py-3 border rounded shadow"
            />
            <button
              id="generate-both"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded shadow-lg"
            >
              Generate
            </button>
          </div>
        </div>

        <div id="loader" className="text-center hidden mb-6">
          <p className="text-lg font-semibold">
            Generating content, please wait...
          </p>
        </div>

        <div
          id="story-output-container"
          className="mb-8 hidden shadow-lg rounded-lg overflow-hidden"
        >
          <h2 className="text-2xl font-bold mb-3 bg-blue-500 text-white p-4">
            Story Output
          </h2>
          <div className="flex flex-col md:flex-row md:space-x-4 p-4 bg-gray-100">
            <div
              id="story-output"
              className="bg-white p-6 border-t border-gray-200 md:w-1/2"
              style={{ height: "full", overflowY: "auto" }}
            ></div>
            <img
              id="generated-image"
              src="https://via.placeholder.com/735x735?text=Generating..."
              alt=""
              className="w-full md:w-1/2 rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <script>{`Your script code goes here`}</script>
    </body>
  </html>
);

export default Layout;
