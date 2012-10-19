## Linefix

Utility written with node.js that will recursively and intelligently fix line endings on a group of files.

Cleans up \r\r\n, \r\n, and \r endings and converts to \n only.

Automatically ignores non-utf8 files as well as anything starting with a '.' ( hidden files )

## Installation

Install [node.js](http://nodejs.org)

Use NPM to install globally

	sudo npm install -g linefix

Then just run from a terminal

	linefix ./path/to/directory

## License

Licensed under the MIT License.