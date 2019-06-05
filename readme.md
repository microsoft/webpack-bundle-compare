## Contributing

### Architecture

Most logic is contained within the UI. We pull webpack analysis JSON down from URLs, process them, and output UI. State is driven via Redux, and the heavy processing of the (potentially very large) webpack stat files happen in a webworker. Actions sent in the redux state are mirrored to the webworker, and in turn the webworker and send actions which get fired back to the host application.

### Iteration

To develop against the UI:

1. Create a folder called "public/samples", and place JSON files in there.
2. Set the `WBC_FILES` environment variable to a comma-delimited list of the filenames you placed in there.
3. Running the webpack dev server via `npm start` will now serve the files you have placed in there.

### Limitations

The main degraded area in our reporting deals with concatenated modules. Essentially, webpack gives us a list of modules and concatenated modules at the top level of their stats output. The concatenated modules are nested inside the parent module, and will contain the full set of module information. However, they don't have module IDs, and when Webpack reports that a given module was imported, it only reports the top-level concatenation. So we can drill into single modules and concatenated bundles fairly well, but we can't cross-reference imports cleanly.
