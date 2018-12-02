class JSONFilter extends HTMLElement
{
    constructor()
    {
        super();

        var keys = [], data = [];

        var element = this;

        var url = element.getAttribute('url');

        var onUpdateTarget = element.getAttribute('onUpdateTarget');

        //{ key: "ID", hidden: true, filter: "" }
        //{ key: "Name", hidden: false, filter: "Justin" }
        //{ key: "Organization", hidden: false, filter: "HR" }

        if (!url || !onUpdateTarget)
        {
            throw '';
        }

        var request = new XMLHttpRequest();

        request.onload = function ()
        {
            if (this.readyState === 4)
            {
                if (this.status === 200)
                {
                    var res = JSON.parse(this.responseText);
                    if (!Array.isArray(res))
                    {
                        throw '';
                    }
                    data = res;
                    filter(data);
                } else
                {
                    throw '';
                }
            }
        }

        request.open('GET', url, true);

        request.send();

        //This function is called everytime an update is triggered, like if they click a checkbox or type into the textbox
        function publishModel(data)
        {
            var model = data;

            var hidden = keys.filter(x => x.hidden);

            if (hidden)
            {
                //Deletes from the model all of the properties
                hidden.forEach((hiddenValue, hiddenIndex, hiddenArray) =>
                {
                    model.map((modelValue, modelIndex, modelArray) =>
                    {
                        delete modelValue[hiddenValue.key];
                    });
                });
            }

            var filter = keys.filter(x => x.filter);

            var temp = [];

            if (filter)
            {
                //If I have multiple filters, I can concat them into the model and return it.
                filter.forEach((filterValue, filterIndex, filterArray) =>
                {
                    var result = model.filter(x => x[filterValue.key].toLowerCase().indexOf(filterValue.filter.toLowerCase()) !== -1);

                    temp = temp.concat(result);
                });
            }

            return model.concat(temp);
        }

        function filter(data)
        {
            var template = document.createElement('template');

            template.innerHTML = `<div class="legend">
                                    <h4 class="legend-header">Table Title</h4>
                                    <div class="legend-label-container">
                                    </div>
                                 </div>`;

            element.appendChild(template.content.querySelector('.legend-label-container').cloneNode(true));

            for (var key in Object.keys(data[0]))
            {
                keys.push({ key: key, hidden: false, filter: '' });

                var label = document.createElement('label');
                label.classList.add('legend-label');

                var labelCheckBox = document.createElement('input');
                labelCheckBox.type = 'checkbox';
                labelCheckBox.setAttribute('checked', 'checked');
                labelCheckBox.setAttribute('name', key);

                labelCheckBox.addEventListener('click', function (e)
                {
                    var keyIndex = keys.findIndex(x => x.key === key);

                    if (e.target.attributes['checked'].value === 'checked')
                    {
                        //uncheck
                        e.target.attributes['checked'].value = '';

                        keys[keyIndex].hidden = true;

                        keys[keyIndex].filter = '';

                        Function(onUpdateTarget + '(' + JSON.stringify(publishModel(data)) + ')')();
                    }
                    else
                    {
                        //check
                        e.target.attributes['checked'].value = 'checked';

                        keys[keyIndex].hidden = false;

                        Function(onUpdateTarget + '(' + JSON.stringify(publishModel(data)) + ')')();
                    }
                });

                var labelTextBox = document.createElement('input');
                labelTextBox.type = 'text';

                labelTextBox.addEventListener('keyup', function (e)
                {
                    var keyIndex = keys.findIndex(x => x.key === key);

                    keys[keyIndex].filter = e.target.value;

                    var model = publishModel(data);

                    window.setTimeout(function ()
                    {
                        Function(onUpdateTarget + '(' + JSON.stringify(publishModel(data)) + ')')();

                    }, 1000);
                });
            }
        }
    }
}

customElements.define('json-filter', JSONFilter);
