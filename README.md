## PolyglotPT (Polyglot Phrase Translater)

### Who This Tool is Best Suited For
- Users of PolyglotPT will most likely be using this tool alongside [Polyglot](http://airbnb.io/polyglot.js/) to create `Phrase` objects.
- Users who want to perform a translation from one phrase to multiple languages

### Who this Tool is Not Suited For
If you need to perform a single phrase translation from one language to another it's best to use Google's Translate web interface or `google-cloud/translate` client libraries.

### Description
A command-line tool to Google translate a phrase or an object of phrases from one language to one or more languages. PolyglotPT is a library specifically used for [Polyglot](http://airbnb.io/polyglot.js/). This tool can take a file with a single object of deeply-nested keys and provide translations for all it's values.

For example, this object of English phrases:
```
module.exports = {
  nav: {
    title: 'Navigation Title',
    description: 'Navigation Description',
  },
  title: 'Main Title',
}
```
Given to PolyglotPT with the options `--to=es` (Spanish) will be translated to:
```
module.exports = {
  'nav.title': 'Titulo principal',
  'nav.description': 'Título de navegación',
  'title': 'Navegación Descripción',
}
```
As you can see you can have a very deeply nested object of [Polyglot](http://airbnb.io/polyglot.js/) Phrases that need translations! You can then take this outputted object and provide it to Polyglot to translate.

### Dependencies
- `commander`
- `google-translate-api`

### Installation
- to install globally with `npm` use `npm install -g polyglotpt`
- to install globally with `yarn` use `yarn global add polyglotpt`

### Usage
Supported languages are specified in [ISO-639-1](https://cloud.google.com/translate/docs/languages)

#### Translate a phrase
Translate a single phrase to one or more languages to the console:
```
ppt --phrase=<phrase> --from=<language> --to=<language[,language]>
```

#### Translate an object of phrases and output them to the console
Only a single `to` language can be executed at this time.
```
ppt --input=<file> --from=<language> --to=<language>
```

#### Translate an object of phrases and save them to an `output` file
Only a single `to` language can be executed at this time.
```
ppt --input=<file> --from=<language> --to=<language> --output=<file>
```

#### Translate an object of phrases but ignore all phrases that contain the `ignoreToken` value
Translate an input file of an exported object but ignore any values that contain the `ignoreToken` option. In Polyglot there are interpolation variables such as `%{}` that Google Translate fails to translate. All ignored values will be outputted to the console. These unfortunately must be translated another way.
```
ppt --input=<file> --from=<language> --to=<language> --ignoreToken=<token>
```

#### API
|option|description|required|examples|
|---|---|---|--|
|`--from=<language>`|the [language](https://cloud.google.com/translate/docs/languages) to translate from|true|`ppt --from`|
|`--to=<language>[,<language>]`|the [language](https://cloud.google.com/translate/docs/languages) to translate to|true|`ppt --to=es`, `ppt --to=es,ru`|
|`--phrase=<phrase>`|the phrase to translate|true if `input` is not provided|`ppt --phrase='I love coffee'`|
|`--input=<file>`|the input file that contains an object of phrases|true if `phrase` is not provided|`ppt --input=./input.js`|
|`--output=<file>`|the ouput file to output the translations to. If not provided, it will be outputted to the console|false|`ppt --output=./output.js`|
|`--ignoreTokens=<token>`|any phrase that contains the token will be ignored|false|`ppt --ignoreTokens=%{`|

### Contributions
I'd be happy to accept PR's but please open a ticket (if it doesn't exist already) to discuss the bug, request, concern, questions, etc.

### To-Do
- Write tests... of course!
- replace `google-translate-api` with Google's `google-cloud/translate` library. This will require client's to provide their own Google Developer keys and secret.
