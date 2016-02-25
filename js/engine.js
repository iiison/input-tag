'use strict';
(function (w) {
	// will entend the {_conf} object in it,
	// so that {_conf} always remains uncahnged
	var updatedConfs = {};

	/**
	 * Default Object, all the values will be assigned by 
	 * {cons} function, other 2 props will be reflected in 
	 * __proto__ object(will be used rarely)
	 * @type {Object}
	 */
	var _conf = {
		cons : function () {
			this.container = document.getElementsByTagName('body')[0];
			this.multiple = false;
			this.addExt = false;
		},
		container : document.getElementsByTagName('body')[0],
		defaultMail : '@gmail.com'
	};

	/**
	 * {Tag} will be exposed globally, need to instance this 
	 * whenever need to make tag box
	 * @param {object} prefs -- This is to add custom properties,
	 *  Will be extended to {updatedConfs}
	 * @return {[type]}       [description]
	 */
	w.Tag = function(prefs) {
		return _init(prefs); 
	};

	/**
	 * This will initiate everyting, This will:
	 * 	- Extend the {_conf} into {updatedConfs}.
	 * 	- Check and set the right container in which the input-tag will be rendered.
	 * 	- Generate HTML for the input-tag.
	 * 	- Bind Events to the elements of input-tag.
	 * 	
	 * @param  {Object} prefs -- User preferences, that user passed.
	 * @return {DOM Element}  -- This will return the instances of 
	 *  - [Ul] element, to which everything  will be rendered.
	 *  - [input] element, in which you write email.
	 *  - [li] element, this is parent of [input].
	 */
	function _init(prefs) {
		var initialElements;

		_setConfs(prefs);
		_setContainer();
		initialElements = _generateHtml();
		_bindInitialEvents(initialElements);

		return initialElements;
	}


	/**
	 * Binds the events to:
	 *   - Input 
	 *     = key Binding => space(32), enter(13) and backspace(8)
	 *     = Paste Event for multiple inputs at once.
	 *     
	 * @param  {DOM Elements} elems -- The initial elements i.e. UL, LI, INPUT
	 */
	function _bindInitialEvents(elems) {
		/**
		 * {tag} will have the reference of dummy event what we will 
		 * clone when be needed to add new tag to UL.
		 * 
		 * {count} will be a variable in lexical scope of backspace keyup event
		 * this will help to identify the number of key hits.
		 * 
		 * {value} will have to value of input box, this is cached here and wil 
		 * be used at many places to set tag value.
		 *
		 * {validMail} will be true/false based on the value of {value}
		 */
		
		var tag = _createDummyTag(),
			count = 1,
			value, validMail;


		// Focus on input box when user clicks on UL,
		// Ul will look like input box.
		elems.ul.addEventListener('click', function(e){
			elems.input.focus();
		});

		/**
		 * Will capture 3 key events,
		 *   - Space -- when user presses space, {obj['E32']} will be triggered.
		 *   - Enter -- when user presses enter, {obj['E13']} will be triggered.
		 *   - Delete -- when user presses delete/backspace, {obj['E8']} will be triggered.
		 */
		elems.input.addEventListener('keyup', function (e) {
			// Event mapping, will be triggered on the basis of event triggered at 
			// {elems.input}
			var obj = {
				'E32' : _addTagEvent,  	// Space
				'E13' : _addTagEvent, 	// Enter
				'E8' : _removeTagEvent 	// BackSpace
			};

			var event = "E" + e.keyCode;

			value = this.value;
			validMail = _validateEmail(value.trim());

			// This will trigger the right function.
			if(obj[event] && typeof obj[event] === "function"){
				obj[event]();
			}
		});

		/**
		 * Paste Event, this will 
		 *   - Get the value
		 *   - Splits at commas
		 *   - validate each value
		 *     = if value is valid email, a new tag will be added
		 *     = if value is invlid, then it will be stored in to 
		 *     an array and will be shown in the box.
		 */
		elems.input.addEventListener('paste', function (e) {

			// Using time out so that value will be populated in to input box.
			window.setTimeout(function(){
				// splites the value.
				// [incorrects] stores the invalid values.
				var inputVal = elems.input.value.split(","),
					added, incorrects = [];

				// Iterates over the array and validates each value.
				for (var i = inputVal.length; i > 0; i--) {
					value = inputVal[0].trim();
					validMail = _validateEmail(value.trim());
					added = _addTagEvent();

					if(!added){
						incorrects.push(inputVal[0].trim());
					}

					// Remove the value from the array if it's valid one.
					inputVal.splice(0, 1);
				}

				// Joins all invalid values and shows back to user.
				if(incorrects.length > 0){
					inputVal = incorrects.join().replace(/,/g, ", ");
					elems.input.value = inputVal;
				}
			}, 10);

		});

		/**
		 * Helper function to add the Tag.
		 * @return {Boolean} -- true if added, false if there is validation error.
		 */
		function _addTagEvent() {
			var modified;

			if(validMail || updatedConfs.addExt){
				modified = validMail ? value : value + _conf.defaultMail;
				_addTag(elems, modified, tag.cloneNode(true));
				_removeClass(elems.ul, "error");
				return true;
			}else{
				_addClass(elems.ul, "error");
				return false;
			}
		}

		// Helper to remove the tag.
		function _removeTagEvent() {
			var tags;

			if(value.length === 0){
				tags = elems.ul.getElementsByTagName('li');

				if(count === 1){
					_addClass(tags[tags.length - 2], "error");
				}else{
					_deleteTag(tags[tags.length - 2]);
				}

				count = count === 2 ? 1 : 2;
			}
		}
	}

	// Remove class.
	function _removeClass(elem,name){
      var regex = new RegExp(name, 'g');
      elem.className = elem.className.replace(regex, '');
    }

    // Add Class.
    function _addClass(elem,name){
      elem.className += ' ' + name;
    }

    // Deletes the tag.
	function _deleteTag(tag) {
		tag.remove();
	}

	/**
	 * Bind Click events to new added tag
	 *   - li  --  to edit the clicked tag.
	 *   - cross  -- to remove the tag.
	 *   
	 * @param  {DOM Element} li  --  newly added li to ul as tag.
	 * @param  {DOM Elements Object} elems -- Initial Elements
	 */
	function _bindTagEvents(li, elems) {
		var cross = li.getElementsByClassName("tag-cross")[0];

		// gets `innerHTML` of the tag and sets it to input box
		// deletes the tag.
		li.addEventListener('click', function(e) {
			elems.input.value = this.getElementsByClassName("tag-email")[0].innerHTML.trim();
			_deleteTag(this);
		});

		// removes the tag.
		cross.addEventListener('click', function (e) {
			_deleteTag(this.parentNode);
		});
	}

	/**
	 * Adds the tag
	 * @param {DOM Elements Object} elems -- Initial elements
	 * @param {String} value -- input box value.
	 * @param {DOM Element} tag  -- Newly added Tag.
	 */
	function _addTag(elems, value, tag) {
		tag.getElementsByClassName("tag-email")[0].innerHTML = value;

		elems.ul.insertBefore(tag, elems.li);
		_bindTagEvents(tag, elems);

		elems.input.value = "";
	}

	/**
	 * Creates a dummy tag, called only once.
	 * @return {DOM Element} -- The reference of this will be
	 * used every time to clone when new tag is added.
	 */
	function _createDummyTag() {
		var li = _createElm('li');
		var email = _createElm('span');
		var cross = _createElm('span');

		li.className = "tag-list";
		email.className = "tag-email";
		cross.className = "tag-cross";
		cross.innerHTML = "&#215;";

		li.appendChild(email);
		li.appendChild(cross);

		return li;
	}

	// Validates email
	function _validateEmail(value) {
		var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return emailRegex.test(value);
	}

	// Generates the initial state for tag-input.
	function _generateHtml() {
		return _generateInitalState(updatedConfs.container);
	}

	/**
	 * Main function to create and render the UL, Input that is showed 
	 * at initial state of the input-tag.
	 * 
	 * @param  {DOM Element} elem -- Container in which everything will
	 * be rendered.
	 * @return {DOM Element Object}  --  Returns Inital Elements
	 */
	function _generateInitalState(elem) {
		var ul = _createElm('ul');
		var li = _createElm('li');
		var input = _createElm('input');
		var obj;

		ul.className = "tag-container";
		li.className = "tag-list-main";
		input.type = "text";
		input.className = "tag-hidden";

		elem.appendChild(ul).appendChild(li).appendChild(input);

		obj = {
			ul : ul,
			li : li,
			input : input
		}
		return obj;
	}

	// Create elmenet helper.
	function _createElm(name) {
		var e;
		if(name){
			e = document.createElement(name);
		}
		return e;
	}

	// Selects the right container in which the input-tag will be rendered.
	// if user doesn't specify any container then, body will be the default
	// option.
	function _setContainer() {
		var elem = (updatedConfs.container && updatedConfs.container.length > 0) ? updatedConfs.container[0] : updatedConfs.container;

		elem = _checkElem(elem) ? elem : _conf.container;
		updatedConfs.container = elem;
	}

	/**
	 * checks if element is a valid DOM Element.
	 * @param  {DOM Element} elem
	 * @return {Boolean}
	 */
	function _checkElem(elem) {
		try{
			return elem instanceof HTMLElement;
		}catch(err){
			return (typeof elem === "object") && (elem.nodeType===1) && (typeof elem.style === "object") && (typeof elem.ownerDocument ==="object");
		}
	}

	/**
	 * Sets the default conf object i.e. {updatedConfs}.
	 * @param {Object} prefs -- User defined preferences.
	 */
	function _setConfs(prefs) {
		if(prefs && prefs === Object(prefs)){
			updatedConfs = _extendDefaults(prefs, _conf);
		}else{
			 Object.create(_conf).cons.call(updatedConfs);
		}
	}

	// Helper to extend the Object.
	function _extendDefaults(pref, defaults) {
		var newConfs = {};
		var prop;

		Object.create(defaults).cons.call(newConfs);
		
		for(var i in pref){
			newConfs[i] = pref[i];
		}
		return newConfs;
	}
})(window);