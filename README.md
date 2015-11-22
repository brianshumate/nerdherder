```
   _  __           ____ __           __
  / |/ /__ _______/ / // /__ _______/ /__ ____
 /    / -_) __/ _  / _  / -_) __/ _  / -_) __/
/_/|_/\__/_/  \_,_/_//_/\__/_/  \_,_/\__/_/
```

This is NerdHerder, a little toy project that searches GitHub users by
location, and builds a static website containing all the found nerds.

## Prerequisites

This software uses some ES6 features so you should have Node.js version 4 
or higher, otherwise it will not function properly. It could be
more backwards compatible, but we're not going backwards in time 
¯\_(ツ)_/¯.

## Installation

In a typical Node.js application hosted on GitHub fashion, you can install
NerdHerder in short order, like this:

```
git clone https://github.com/brianshumate/nerdherder.git
cd nerdherder
npm install
npm link
```

## Usage

Simple usage example:

```
nerdherder <GitHub_API_token> Boone
```

This will herd nerds, build a static website in the `./build` directory and
start an HTTP server on port *8080*. Example output:

![](https://raw.githubusercontent.com/brianshumate/nerdherder/master/share/screen-shot.png)

Check out a live example of the resulting page here: 
http://boone-nerds.brianshumate.com/

## Bugs

Yes.

## Thanks

* [Brent Woodruff](https://github.com/fprimex) for the name idea
