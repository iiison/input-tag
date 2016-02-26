# input-tag
input-tag is a JS-based plugin to add multiple queries tags to input. It supports adding, deleting, and editing of tag. Tags
can be used to search, sort and other multiple places. 

To get started, checkout examples at `index.html` file.



## Use cases

- Enhancing native text input with search tags.
- Enhancing native text input with a better multi-tag interface.
- Email tags: validates the email, if flag is passed.
- Tagging: ability to add new items on the fly.
- Templating: support for custom rendering of results and selections.


## Usage

- Select a container, eg. 
  ```javascript
  var q = document.getElementsByClassName("xx")[0];
  ```

- Create conf object
  ```javascript
  var confs = {
    container : q, // by default it will be body
    addExt : true // default value false, addes a common string at the end of tag.(can be used in case of email tagging)
    defaultString : 'someString' // By default it is @gmail.com
  }
  ```
- Create instance of the `Tag` class and pass the `confs` to its constructor

  ```javascript
  var tag = new Tag(confs)
  ```

