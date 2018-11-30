class JSONFilter
{
    constructor(options)
    {
        var keys = [], data = [];

        //{ key: "ID", hidden: true, filter: "" }
        //{ key: "Name", hidden: false, filter: "Justin" }
        //{ key: "Organization", hidden: false, filter: "HR" }

        if (!options.data || (options.data.ajax && options.data.json))
        {
            throw '';
        }

        if (options.data.ajax)
        {
            var request = new XMLHttpRequest();
             request.onload = function(){
                if(this.readyState === 4){
    
                    if(this.status === 200){
                       var res = JSON.parse(this.responseText);
                        if (!Array.isArray(res))
                        {
                            throw '';
                        }
                         data = res;
                         filter(data);
                     }else{
                        throw '';
                    }
                }
            }
            
            request.open('GET', options.data.ajax.url, true);
            
            request.send();
        }

        if (options.data.json)
        {
            data = options.data.json;

            filter(data);
        }

        //This function is called everytime an update is triggered, like if they click a checkbox or type into the textbox
        function publishModel(data)
        {
            var model = data;

            var hidden = keys.filter(x => x.hidden);

            //Deletes from the model all of the properties
            hidden.forEach((hiddenValue, hiddenIndex, hiddenArray) =>
            {
                model.map((modelValue, modelIndex, modelArray) =>
                {
                    delete modelValue[hiddenValue.key];
                });
            });

            var filter = keys.filter(x => x.filter);

            var temp = [];

            //If I have multiple filters, I can concat them into the model and return it.
            filter.forEach((filterValue, filterIndex, filterArray) =>
            {
                var result = model.filter(x => x[filterValue.key].indexOf(filterValue.filter) !== -1);

                temp = temp.concat(result);
            });

            return model.concat(temp);
        }

        function filter(data)
        {
            var template = document.createElement('template');

            template.innerHTML = `<div class="table-legend">
                                    <h4 class="table-legend-header">Legend</h4>
                                    <div class="table-data-container"></div>
                                  </div>`;

            for (var key in Object.keys(data[0]))
            {
                keys.push({
                    key: key,
                    hidden: false,
                    filter: ''
                });

                var label = new HTMLLabelElement();

                var labelCheckBox = new HTMLInputElement();
                labelCheckBox.type = 'checkbox';
                labelCheckBox.setAttribute('checked', 'checked');
                label.setAttribute('value', key);

                labelCheckBox.addEventListener('click', function (e)
                {
                    var keyIndex = keys.findIndex(x => x.key === key);

                    if (e.target.attributes['checked'].value === 'checked')
                    {
                        //uncheck
                        e.target.attributes['checked'].value = '';

                        keys[keyIndex].hidden = true;

                        keys[keyIndex].filter = '';

                        options.onUpdateTarget(publishModel(data));
                    }
                    else
                    {
                        //check
                        e.target.attributes['checked'].value = 'checked';

                        keys[keyIndex].hidden = false;

                        options.onUpdateTarget(publishModel(data));
                    }
                });

                var labelTextBox = new HTMLInputElement();
                labelTextBox.type = 'text';

                labelTextBox.addEventListener('keyup', function (e)
                {
                    var keyIndex = keys.findIndex(x => x.key === key);

                    keys[keyIndex].filter = e.target.value;

                    var model = publishModel(data);

                    window.setTimeout(function ()
                    {
                        options.onUpdateTarget(model);

                    }, 1000);
                });
            }
        }
    }
}
