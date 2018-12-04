customElements.define('json-filter', class extends HTMLElement{

    constructor(){
        super();

        var element = this;

        this.keys = [];

        if(!this.getAttribute('onUpdateTarget') || !this.getAttribute('url')){
            throw '';
        }

        var template = document.createElement('template');

        template.innerHTML = `<style>
                                    .json-filter {
                                        background-color: #122B4D;
                                        height: 150px;
                                        width: 390px;
                                        float: right;
                                        margin-top: 10px;
                                        padding-top: 5px;
                                        overflow-y: auto;
                                        padding-bottom: 10px;
                                    }

                                    .json-filter-header {
                                        color: white;
                                        text-align: center;
                                    }

                                    .json-filter-label-container {
                                        display: flex;
                                        flex-direction: column;
                                        margin-top: 5px;
                                        margin: 0 auto;
                                        width: 85%;
                                    }

                                    .json-filter-label {
                                        margin-bottom: 5px;
                                        display: inherit;
                                        position: relative;
                                        padding-left: 22px;
                                    }

                                    .json-filter-label-text {
                                        background-color: #274368;
                                        color: white;
                                        border: none;
                                        padding: 5px;
                                        width: 100%;
                                        margin-left: 13px;
                                    }

                                    ::placeholder {
                                        color: darkgray;
                                    }

                                </style>
                                 <div class="json-filter">
                                    <h4 class="json-filter-header">${element.getAttribute('title')}</h4>
                                    <div class="json-filter-label-container">
                                    </div>
                                 </div>`;

        this.appendChild(template.content.cloneNode(true));

        var request = new XMLHttpRequest();

        request.onload = function() {
            if(this.readyState === 4){
                if(this.status === 200){
                    var data = JSON.parse(this.responseText);
                    element.filter(data);

                    if(!Array.isArray(data)){
                        throw '';
                    }
                }
            }
        }
        
        request.open('GET', this.getAttribute('url'), true);

        request.send();
    }

    filter(data){

        var firstRow = data[0];
        
        var element = this;
        
        var onUpdateTarget = element.getAttribute('onUpdateTarget');

        Object.keys(firstRow).forEach(function(value, index, array){

            var onUpdateTarget = element.getAttribute('onUpdateTarget');

            element.keys.push({ key: value, hidden: false, filter: '' });

            var label = document.createElement('span');
            label.classList.add('json-filter-label');

            var labelTextBox = document.createElement('input');
            labelTextBox.classList.add('json-filter-label-text');
            labelTextBox.type = 'textbox';
            labelTextBox.setAttribute('name', value);
            labelTextBox.placeholder = value;

            var timeout = null;

            labelTextBox.addEventListener('keyup', function(e){
                var keyIndex = element.keys.findIndex(x => x.key === value);
                element.keys[keyIndex].filter = e.target.value;
                clearTimeout(timeout);
                var model = element.publishModel(data);
                timeout = window.setTimeout(function(){
                    new Function(onUpdateTarget + '(' + JSON.stringify(model) +')')();
                }, 1000);
            });
            
            label.appendChild(labelTextBox);

            var labelCheckBox = document.createElement('input');
            labelCheckBox.type = 'checkbox';
            labelCheckBox.setAttribute('checked', 'checked');
            labelCheckBox.setAttribute('name', value);

            labelCheckBox.addEventListener('click', function(e){
                var keyIndex = element.keys.findIndex(x => x.key === value);
                if (e.target.attributes['checked'].value === 'checked'){
                    //uncheck
                    e.target.attributes['checked'].value = '';
                    element.keys[keyIndex].hidden = true;
                    element.keys[keyIndex].filter = '';
                    var model = element.publishModel(data);
                    new Function(onUpdateTarget + '(' + JSON.stringify(model) + ')')();
                }
                else{
                    //check
                    e.target.attributes['checked'].value = 'checked';
                    element.keys[keyIndex].hidden = false;
                    var model = element.publishModel(data);
                    new Function(onUpdateTarget + '(' + JSON.stringify(model) + ')')();
                }
            });

            label.appendChild(labelCheckBox);

            element.querySelector('.json-filter-label-container').appendChild(label);
        });
        
        new Function(onUpdateTarget + '(' + JSON.stringify(element.publishModel(data)) + ')')();
    }

    
    publishModel(data)
    {
        //I have to parse this data into JSON so I can do a shallow copy (and not a deep copy, else I would be changing a referenced object)
        var model = JSON.parse(JSON.stringify(data))
        var hidden = this.keys.filter(x => x.hidden);
        if (hidden)
        {
            hidden.forEach(function (hiddenValue, hiddenIndex, hiddenArray)
            {
                model.map(function (modelValue, modelIndex, modelArray)
                {
                    delete modelValue[hiddenValue.key];
                });
            });
        }
        var filter = this.keys.filter(x => x.filter);
        if (filter)
        {
            var temp = [];

            filter.forEach(function (filterValue, filterIndex, filterArray)
            {
                var value = filterValue.filter.toLowerCase();

                //filter on each key for value and if it isn't already in temp
                var result = model.filter(modelProperty => modelProperty[filterValue.key].toString().toLowerCase().indexOf(value) !== -1 && !temp.some(tempProperty => tempProperty[filterValue.key] === modelProperty[filterValue.key]));

                temp = temp.concat(result);
            });

            if (temp.length)
            {
                model = temp;
            }
        }
        return model;
    }
});
