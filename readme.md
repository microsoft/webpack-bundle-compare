## Contributing

### Architecture

Most logic is contained within the UI. We pull webpack analysis JSON down from URLs, process them, and output UI. State is driven via Redux, and the heavy processing of the (potentially very large) webpack stat files happen in a webworker. Actions sent in the redux state are mirrored to the webworker, and in turn the webworker and send actions which get fired back to the host application.

### Iteration

To develop against the UI:

1. Create a folder called "public/samples", and place JSON files in there.
2. Set the `WBC_FILES` environment variable to a comma-delimited list of the filenames you placed in there.
3. Running the webpack dev server via `npm start` will now serve the files you have placed in there.
