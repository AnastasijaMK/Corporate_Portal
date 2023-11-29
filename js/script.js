// Корректировка отображения всплывающих окон на мобильной версии
function calcVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
calcVh();

window.addEventListener('resize',()=>{
    calcVh();
});


// Выпадающие списки
const dropdown = document.querySelectorAll('.dropdown');
if(dropdown.length > 0) {
    initDropdown(dropdown);
}
function initDropdown(dropdown) {
    for(let i=0; i<dropdown?.length; i++) {
        // Открыть/закрыть выпадающий список
        const dropdownButton = dropdown[i].querySelector('.dropdown__button');
        dropdownButton.addEventListener('click',()=>{
            dropdown[i].classList.toggle('dropdown--active');
            if(dropdown[i].classList.contains('dropdown--active')) {
                checkListHeight(dropdown[i].querySelector('.dropdown__list'));
                controlListShadow(dropdown[i].querySelector('.dropdown__list'))
            }
        });

        // Выбор в выпадающем списке
        const dropdownItem = dropdown[i].querySelectorAll('.checkbox__field');
        for(let k=0; k<dropdownItem?.length; k++) {
            initDropdownItem(dropdownItem[k]);
        }
    }
}

// Выбор в выпадающем списке
function initDropdownItem(dropdownItem) {
    dropdownItem.addEventListener('click',()=>{
        let dropdown = dropdownItem.closest('.dropdown');

        if(dropdown.closest('.cell--edited')) {
            dropdown.querySelector('.dropdown__text').innerText = dropdownItem.getAttribute('data-value');
            if(dropdown.querySelector('.dropdown__text').innerText !== dropdown.closest('.cell').getAttribute('data-initial-value')) {
                dropdown.closest('.cell').classList.add('cell--changed');
            } else {
                dropdown.closest('.cell').classList.remove('cell--changed');
            }
            // Пересчет ширины столбцов с учетом нового содержимого ячеек
            const tableWrap = document.querySelectorAll('.table__wrap');
            for(let i=0; i<tableWrap.length; i++) {
                setTimeout(()=>{
                    calcColumnWidth(tableWrap[i]);
                }, 200);
            }
            // Проверка на наличие измененнных ячеек
            checkEditedCells();
        } else {
            dropdown.querySelector('.dropdown__text').value = dropdownItem.closest('.dropdown__item').querySelector('.checkbox__box').innerHTML;
        }

        dropdown.classList.remove('dropdown--active');

        if(dropdown.closest('.settings__item--form') && dropdown.closest('.popup--constructor') && document.querySelectorAll('.form_list__item--active').length > 0) {
            document.querySelector('.form_list__item--active').classList.remove('form_list__item--active');
        }

        if(dropdown.closest('.settings__item--form') && dropdown.closest('.popup--constructor')) {
            let reportSelected = dropdownItem.getAttribute('data-report');
            for(let k=0; k<savedReports?.length; k++) {
                if(savedReports[k].name == reportSelected) {
                    let columns = savedReports[k].columns;
                    let columnsInTable = document.querySelectorAll('.constructor__checkbox');
                    for(let i=0; i<columnsInTable?.length; i++) {
                        columnsInTable[i].querySelector('input').checked = false;
                        let columnType = columnsInTable[i].querySelector('input').getAttribute('name');
                        for(let l=0; l<columns?.length; l++) {
                            if(columns[l].toLowerCase() == columnType.toLowerCase()) {
                                columnsInTable[i].querySelector('input').checked = true;
                            }
                        }
                    }
                }
            }
        }

        if(dropdown.closest('.settings__item--form') &&
            dropdown.closest('.settings__item--form').getAttribute('data-settings') === 'report' &&
            !dropdown.closest('.popup--constructor')) {
            let reportSelected = dropdownItem.getAttribute('data-report');
            for(let k=0; k<savedReports?.length; k++) {
                if(savedReports[k].name == reportSelected) {
                    let columns = savedReports[k].columns;
                    let columnsInTable = document.querySelectorAll('.table__cell');
                    for(let i=0; i<columnsInTable?.length; i++) {
                        columnsInTable[i].style.display = 'none';
                        let columnType = columnsInTable[i].getAttribute('data-column');
                        for(let l=0; l<columns?.length; l++) {
                            if(columns[l].toLowerCase() == columnType.toLowerCase()) {
                                columnsInTable[i].style.display = 'flex';
                            }
                        }
                    }
                    setTimeout(() => {
                        document.querySelector('.table__body .table__inner').style.transition = 'none';
                        document.querySelector('.table__body .table__inner').style.left = '';
                        document.querySelector('.table__body .table__inner').style.transition = '';
                        document.querySelector('.table__header .table__inner').style.transition = 'none';
                        document.querySelector('.table__header .table__inner').style.left = '';
                        document.querySelector('.table__header .table__inner').style.transition = '';
                        checkArrowVisibility();
                    }, 100);
                }
            }
        }
    });
}

// Выпадающие списки. Добавляем дымку, если список длинный
function checkListHeight(list) {
    if(list) {
        const listGroup = list.querySelector('.list__group');
        const listInner = list.querySelector('.list__inner');
        if(listGroup.offsetHeight > listInner.offsetHeight) {
            listInner.classList.add('list__inner--hidden');
        } else {
            listInner.classList.remove('list__inner--hidden');
        }
    }
}

// Выпадающие списки. Убираем дымку при прокрутке списка до конца
function controlListShadow(list) {
    if(list) {
        const listInner = list.querySelector('.list__inner');
        const listGroup = list.querySelector('.list__group');
        listInner.addEventListener('scroll', () => {
            const scrollTopInner = Math.round(listInner.scrollTop);
            const scrollTopGroup = Math.round(listGroup.offsetHeight - listInner.offsetHeight);
            if (Math.abs(scrollTopInner - scrollTopGroup) <= 3) {
                listInner.classList.add('scroll-to-end');
            } else {
                listInner.classList.remove('scroll-to-end');
            }
        });
    }
}


// Выпадающие списки. Проверка, умещается ли окно на экране
function checkFilterVisibility(filter) {
    let filterPositionRight = filter.getBoundingClientRect().right;
    let filterPositionLeft = filter.getBoundingClientRect().left;
    let table = filter.closest('.table');
    let tablePositionRight = table.getBoundingClientRect().right;
    let tablePartPositionLeft = filter.closest('.table__part').getBoundingClientRect().left;
    let tableInnerPositionRight = table.querySelector('.table__inner').getBoundingClientRect().right;
    let tableShiftLeft;
    if (tableInnerPositionRight < filterPositionRight) {
        filter.classList.add('filter--right');
    } else if(filterPositionLeft < tablePartPositionLeft) {
        tableShiftLeft = +(getComputedStyle(table.querySelector('.table__inner')).left.replace('px','')) + (tablePartPositionLeft - filterPositionLeft) + 10;
    } else if(filterPositionRight > tablePositionRight) {
        tableShiftLeft = +(getComputedStyle(table.querySelector('.table__inner')).left.replace('px','')) - (filterPositionRight - tablePositionRight) - 20;
    }
    table.querySelector('.table__body .table__inner').style.left = tableShiftLeft + 'px';
    table.querySelector('.table__header .table__inner').style.left = tableShiftLeft + 'px';
}


document.addEventListener('mouseup',(e)=>{
    // Закрытие выпадающих списков по клику вне списков
    if(document.querySelectorAll('.dropdown--active')?.length > 0 &&
        document.querySelector('.dropdown--active') !== e.target &&
        !document.querySelector('.dropdown--active')?.contains(e.target)) {
        document.querySelector('.dropdown--active')?.classList.remove('dropdown--active');
    }

    // Закрытие фильтров по клику вне фильтра
    if(document.querySelectorAll('.cell--open')?.length > 0 &&
        document.querySelector('.cell--open') !== e.target &&
        !document.querySelector('.cell--open')?.contains(e.target)) {
        document.querySelector('.cell--open .j-filter-cancel').click();

    }
});


// Открыть/скрыть фильтр в таблице
const filterTableButton = document.querySelectorAll('.j-cell-open-dropdown');
for(let i=0; i<filterTableButton?.length; i++) {
    filterTableButton[i].addEventListener('click',()=>{
        const cell = filterTableButton[i].closest('.cell');
        removeSelected(cell.querySelector('.filter'));
        cell.classList.toggle('cell--open');
        if(!cell.classList.contains('cell--open') && cell.querySelector('.filter').classList.contains('filter--right')) {
            cell.querySelector('.filter').classList.remove('filter--right');
        }
        if(cell.classList.contains('cell--open')) {
            checkListHeight(cell.querySelector('.filter__list'));
            controlListShadow(cell.querySelector('.filter__list'))
            checkFilterVisibility(cell.querySelector('.filter'));
            getSelected(cell.querySelector('.filter'));
        }
    });
}

// Запомнить исходно выбранные значения в фильтре и сортировке
function getSelected(filter) {
    let cell = filter.closest('.cell');
    if(cell.classList.contains('table__cell--sort-applied')) {
        let sortItem = filter.querySelectorAll('.sort__item .checkbox__field');
        for(let i=0; i<sortItem?.length; i++) {
            if(sortItem[i].checked) {
                cell.setAttribute('data-sort',sortItem[i].value);
            }
        }
    }
    if(filter.closest('.cell').classList.contains('table__cell--filter-applied')) {
        if(filter.classList.contains('filter--range')) {
            let filterField = filter.querySelectorAll('.range__input');
            let minRange;
            let maxRange;
            if(filterField[0].value.trim().length > 0) {
                minRange = filterField[0].value;
                cell.setAttribute('data-range-min',minRange);
            }
            if(filterField[1].value.trim().length > 0) {
                maxRange = filterField[1].value;
                cell.setAttribute('data-range-max',maxRange);
            }
        } else {
            let filterData = '';
            let filterItem = filter.querySelectorAll('.filter__list .checkbox__field');
            for(let i=0; i<filterItem?.length; i++) {
                if(filterItem[i].checked) {
                    filterData += filterItem[i].getAttribute('id');
                    filterData += ' ';
                }
            }
            cell.setAttribute('data-filter',filterData);
        }
    }
}

// Убрать запомненные исходно выбранные значения в фильтре и сортировке
function removeSelected(filter) {
    let cell = filter.closest('.cell');
    cell.removeAttribute('data-sort');
    if(filter.classList.contains('filter--range')) {
        cell.removeAttribute('data-range-min');
        cell.removeAttribute('data-range-max');
    } else {
        cell.removeAttribute('data-filter');
    }
}

// Выбор в фильтре
const checkboxInFilter = document.querySelectorAll('.filter__checkbox .checkbox__field');
for(let i=0; i<checkboxInFilter?.length; i++) {
    checkboxInFilter[i].addEventListener('change',()=>{
        if(checkboxInFilter[i].classList.contains('checkbox__field--all')) {
            // Клик по "Выделить все"
            let boxChecked = checkboxInFilter[i].checked ? true : false;
            const checkbox = checkboxInFilter[i].closest('.filter__list').querySelectorAll('.checkbox__field');
            for(let l=0; l<checkbox.length; l++) {
                checkbox[l].checked = boxChecked;
            }
        } else if (!checkboxInFilter[i].checked) {
            checkboxInFilter[i].closest('.filter__list').querySelector('.checkbox__field--all').checked = false;
        }

        // Проверка необходимости отображения "Очистить фильтр"
        if(checkFilter(checkboxInFilter[i].closest('.table__cell').querySelectorAll('.filter__list'))) {
            checkboxInFilter[i].closest('.table__cell').querySelector('.j-filter-clear').classList.add('filter-clear--active');
        } else {
            checkboxInFilter[i].closest('.table__cell').querySelector('.j-filter-clear').classList.remove('filter-clear--active');
        }
    });
}

// Проверка отмеченных чекбоксов в фильтре
function checkFilter(filter) {
    let filterApply = false;
    for(let i=0; i<filter.length; i++) {
        if(filter[i].closest('.filter').classList.contains('filter--range')) {
            let filterField = filter[i].querySelectorAll('.range__input');
            for(let i=0; i<filterField.length; i++) {
                if(filterField[i].value.trim().length > 0) {
                    filterApply = true;
                }
            }
        } else {
            let filterItem = filter[i].querySelectorAll('.checkbox__field');
            for(let i=0; i<filterItem.length; i++) {
                if(filterItem[i].checked) {
                    filterApply = filterItem[i].classList.contains('checkbox__field--no-filter') ? false : true;
                }
            }
        }
    }
    return(filterApply);
}

// Проверка, применяется ли сортировка
function checkSort(sort) {
    let sortApply = false;
    for(let i=0; i<sort.length; i++) {
        const sortItem = sort[i].querySelectorAll('.checkbox__field');
        for(let i=0; i<sortItem.length; i++) {
            if(sortItem[i].checked && sortItem[i].value !== 'sort-default') {
                sortApply = true;
            }
        }
    }
    return(sortApply);
}

// Применить фильтр в столбце таблицы
const filterApplyButton = document.querySelectorAll('.j-filter-apply');
for(let i=0; i<filterApplyButton?.length; i++) {
    filterApplyButton[i].addEventListener('click',(e)=>{
        e.preventDefault();
        const cell = filterApplyButton[i].closest('.cell');
        let apply = true;
        if(cell.querySelectorAll('.filter__range').length > 0) {
            // Если интервал указан неверно, фильтр не применяется
            if(cell.querySelectorAll('.wrong-interval').length > 0) {
                apply = false;
            }
            let rangeFields = cell.querySelectorAll('.range__input');
            for(let k=0; k<rangeFields?.length; k++) {
                if(!rangeFields[k].validity.valid) {
                    apply = false;
                }
            }
        } 
        if(apply) {
            cell.classList.remove('cell--open');

            if(cell.querySelector('.filter').classList.contains('filter--right')) {
                cell.querySelector('.filter').classList.remove('filter--right');
            }

            if(checkSort(cell.querySelectorAll('.filter__sort'))) {
                cell.classList.add('table__cell--sort-applied');
                let sortItem = cell.querySelectorAll('.sort__item .checkbox__field');
                let sortClass;
                for(let k=0; k<sortItem?.length; k++) {
                    if(sortItem[k].checked && sortItem[k].value == 'sort-down') {
                        cell.classList.remove('table__cell--sort-up');
                        cell.classList.add('table__cell--sort-down');
                        cell.querySelector('.filter').setAttribute('data-sort','sort-down');
                    } else if(sortItem[k].checked && sortItem[k].value == 'sort-up') {
                        cell.classList.remove('table__cell--sort-down');
                        cell.classList.add('table__cell--sort-up');
                        cell.querySelector('.filter').setAttribute('data-sort','sort-up');
                    }
                }
            } else {
                cell.classList.remove('table__cell--sort-applied');
                cell.classList.remove('table__cell--sort-down');
                cell.classList.remove('table__cell--sort-up');
                cell.querySelector('.filter').setAttribute('data-sort','default');
            }

            if(cell.querySelectorAll('.filter__range').length > 0 && checkFilter(cell.querySelectorAll('.filter__range'))) {
                cell.classList.add('table__cell--filter-applied');
                // Выводим отмеченные фильтры
                addFilterOutput(cell);
            } else if(cell.querySelectorAll('.filter__list').length > 0 && checkFilter(cell.querySelectorAll('.filter__list'))) {
                cell.classList.add('table__cell--filter-applied');
                // Выводим отмеченные фильтры
                addFilterOutput(cell);
            } else if(cell.querySelector('.filter').getAttribute('data-filter') === 'search') {
                if(cell.querySelector('.search__field').value.trim().length > 0) {
                    cell.classList.add('table__cell--filter-applied');
                    // Выводим отмеченные фильтры
                    addFilterOutput(cell);
                    cell.querySelector('.j-filter-clear').click();
                }
            } else {
                cell.classList.remove('table__cell--filter-applied');
                // Убираем снятый фильтр
                removeFilterOutput(cell);
            }

            removeSelected(cell.querySelector('.filter'));
        }
    });
}


// Отменить фильтр в столбце таблицы
const filterCancelButton = document.querySelectorAll('.j-filter-cancel');
for(let i=0; i<filterCancelButton?.length; i++) {
    filterCancelButton[i].addEventListener('click',(e)=>{
        e.preventDefault();
        let cell = filterCancelButton[i].closest('.cell');
        let filter = filterCancelButton[i].closest('.filter');
        // Сбрасываем выбранные значения
        clearFilter(filter);
        // Возвращаем исходные значения
        returnFilter(filter);
        cell.classList.remove('cell--open');
        if(cell.querySelector('.filter').classList.contains('filter--right')) {
            cell.querySelector('.filter').classList.remove('filter--right');
        }
        removeSelected(cell.querySelector('.filter'));
    });
}


// Полный сброс выбора в окне фильтра
function clearFilter(filter) {
    let sortItem = filter.querySelectorAll('.sort__item .checkbox__field');
    for(let i=0; i<sortItem?.length; i++) {
        sortItem[i].checked = sortItem[i].value == 'sort-default' ? true : false;
    }
    filter.querySelector('.j-filter-clear').click();
}


// Возвращаем исходные значения в окно фильтра
function returnFilter(filter) {
    let cell = filter.closest('.cell');
    let sortItem = filter.querySelectorAll('.sort__item .checkbox__field');
    for(let i=0; i<sortItem?.length; i++) {
        if(cell.hasAttribute('data-sort') && sortItem[i].value == cell.getAttribute('data-sort')) {
            sortItem[i].checked = true;
        } else if(sortItem[i].value == 'sort-default') {
            sortItem[i].checked = true;
        }
    }
    if(cell.hasAttribute('data-filter')) {
        let checkedFilter = cell.getAttribute('data-filter').split(' ');
        for(let k=0; k<checkedFilter?.length; k++) {
            let filterItem = filter.querySelectorAll('.filter__list .checkbox__field');
            for(let l=0; l<filterItem?.length; l++) {
                if(filterItem[l].getAttribute('id') == checkedFilter[k]) {
                    filterItem[l].click();
                }
            }
        }
    } else if(filter.classList.contains('filter--radio')) {
        filter.querySelector('.checkbox__field--no-filter').click();
    }
    if(cell.hasAttribute('data-range-min')) {
        filter.querySelectorAll('.range__input')[0].value = cell.getAttribute('data-range-min');
        filter.querySelector('.j-filter-clear').classList.add('filter-clear--active');
    }
    if(cell.hasAttribute('data-range-max')) {
        filter.querySelectorAll('.range__input')[1].value = cell.getAttribute('data-range-max');
        filter.querySelector('.j-filter-clear').classList.add('filter-clear--active');
    }
}


// Очистить фильтр в столбце таблицы
const filterClearButton = document.querySelectorAll('.j-filter-clear');
for(let i=0; i<filterClearButton?.length; i++) {
    filterClearButton[i].addEventListener('click',(e)=>{
        e.preventDefault();
        let filter = filterClearButton[i].closest('.filter');
        if(filter.classList.contains('filter--range')) {
            filterClearButton[i].closest('.filter__form').querySelector('.filter__range').classList.remove('wrong-interval');
            let filterFields = filterClearButton[i].closest('.filter__form').querySelectorAll('.range__input');
            for(let k=0; k<filterFields.length; k++) {
                filterFields[k].value = '';
            }
        }  else if(filter.getAttribute('data-filter') === 'search') {
            let search =  filterClearButton[i].closest('.filter').querySelector('.search__field');
            if(search) {
                search.value = '';
            }
        } else {
            let search =  filterClearButton[i].closest('.filter').querySelector('.search__field');
            if(search) {
                search.value = '';
            }
            if(filterClearButton[i].closest('.filter').querySelector('.filter__not-found')) {
                filterClearButton[i].closest('.filter').querySelector('.filter__not-found').remove();
            }
            let filterItem = filterClearButton[i].closest('.filter__form').querySelectorAll('.checkbox__field');
            for(let k=0; k<filterItem.length; k++) {
                filterItem[k].checked = false;
                if(filterItem[k].classList.contains('checkbox__field--no-filter')) {
                    filterItem[k].checked = true;
                }
                filterItem[k].closest('.filter__item').style.display = '';
            }
            checkListHeight(filterClearButton[i].closest('.filter').querySelector('.filter__list'));
            controlListShadow(filterClearButton[i].closest('.filter').querySelector('.filter__list'));
        }
        filterClearButton[i].classList.remove('filter-clear--active');
    });
}


// Выводим отмеченные фильтры
function addFilterOutput(cell) {
    let filterOutputWrap = document.querySelector('.filter_output');
    let filterOutputItem = filterOutputWrap?.querySelectorAll('.filter_output__item[data-filter="'+ cell.getAttribute('data-column') +'"]');
    let filterValue = getFilterValue(cell);
    let filterTitle = cell.querySelector('.cell__name').innerText;
    if(filterOutputItem.length === 0) {
        let filterOutputItemNew = document.createElement('div');
        filterOutputItemNew.className = 'filter_output__item j-filter_output__item';
        if(cell.querySelector('.filter').classList.contains('filter--range')) {
            filterOutputItemNew.classList.add('filter_output__item--range');
        } else if(cell.querySelector('.filter').classList.contains('filter--radio')) {
            filterOutputItemNew.classList.add('filter_output__item--radio');
        } else if(cell.querySelector('.filter').getAttribute('data-filter') === 'search') {
            filterOutputItemNew.classList.add('filter_output__item--search');
        } else {
            filterOutputItemNew.classList.add('filter_output__item--checkbox');
        }
        filterOutputItemNew.innerHTML = '<span class="filter_output__text"><span class="filter_output__title">' + filterTitle + ':</span></span><button class="filter_output-clear j-filter_output-clear"></button>';
        filterOutputItemNew.setAttribute('data-filter', cell.getAttribute('data-column'));
        initFilterOutputOpen(filterOutputItemNew);
        initFilterOutputClear(filterOutputItemNew.querySelector('.j-filter_output-clear'));
        filterOutputWrap.append(filterOutputItemNew);
        filterOutputItemNew.querySelector('.filter_output__title').after(filterValue);
    } else {
        filterOutputItem[0].querySelector('.filter_output__value_wrap').remove();
        filterOutputItem[0].querySelector('.filter_output__title').after(filterValue);
    }
}

// Убираем снятый фильтр
function removeFilterOutput(cell) {
    let filterOutputItem = document.querySelectorAll('.filter_output__item[data-filter="'+ cell.getAttribute('data-column') +'"]');
    filterOutputItem[0]?.remove();
}


// Удаление вывода значений конкретного фильтра
let filterOutputClearButton = document.querySelectorAll('.j-filter_output-clear');
for(let i=0; i<filterOutputClearButton?.length; i++) {
    initFilterOutputClear(filterOutputClearButton[i]);
}
function initFilterOutputClear(button) {
    button.addEventListener('click',()=>{
        if(button.closest('.filter_output__item').classList.contains('filter_output__item--search')) {
            document.querySelector('.cell[data-column="'+ button.closest('.filter_output__item').getAttribute('data-filter') +'"] .j-filter-clear').click();
            button.closest('.filter_output__item').remove();
            document.querySelector('.cell[data-column="'+ button.closest('.filter_output__item').getAttribute('data-filter') +'"]').classList.remove('table__cell--filter-applied');
        } else {
            document.querySelector('.cell[data-column="'+ button.closest('.filter_output__item').getAttribute('data-filter') +'"] .j-filter-clear').click();
            document.querySelector('.cell[data-column="'+ button.closest('.filter_output__item').getAttribute('data-filter') +'"] .j-filter-apply').click();
        }
    });
}

// Открытие фильтра по клику на выведенные значения
let filterOutputOpenButton = document.querySelectorAll('.j-filter_output__item');
for(let i=0; i<filterOutputOpenButton?.length; i++) {
    initFilterOutputOpen(filterOutputOpenButton[i]);
}
function initFilterOutputOpen(button) {
    button.addEventListener('click',(e)=>{
        if(e.target !== button.querySelector('.j-filter_output-clear')) {
            document.querySelector('.cell[data-column="'+ button.closest('.filter_output__item').getAttribute('data-filter') +'"] .j-cell-open-dropdown').click();
        }
    });
}

// Получение выбранного значения фильтра 
function getFilterValue(cell) {
    let outputWrap = document.createElement('span');
    outputWrap.classList.add('filter_output__value_wrap');
    if(cell.querySelectorAll('.filter__range').length > 0) {
        let output = document.createElement('span');
        output.classList.add('filter_output__value');
        let cellFilterField = cell.querySelectorAll('.range__input');
        if(cellFilterField[0].value.length > 0 && cellFilterField[1].value.length) {
            output.innerText = cellFilterField[0].value + ' - ' + cellFilterField[1].value;
        } else if(cellFilterField[0].value.length > 0) {
            output.innerText = 'от ' + cellFilterField[0].value;
        } else {
            output.innerText = 'до ' + cellFilterField[1].value;
        }
        outputWrap.append(output);
    } else if(cell.querySelector('.filter').getAttribute('data-filter') === 'search') {
        let output = document.createElement('span');
        output.classList.add('filter_output__value');
        output.innerText = cell.querySelector('.search__field').value;
        outputWrap.append(output);
    } else {
        let cellFilterItem = cell.querySelectorAll('.filter__list .checkbox__field');
        for(let i=0; i<cellFilterItem?.length; i++) {
            if(!cellFilterItem[i].classList.contains('checkbox__field--all') && cellFilterItem[i].checked) {
                let output = document.createElement('span');
                output.classList.add('filter_output__value');
                output.setAttribute('data-id',cellFilterItem[i].getAttribute('id'));
                output.innerText = cellFilterItem[i].nextElementSibling.innerText;
                outputWrap.append(output);
                outputWrap.append(', ');
            }
        }
        // Убираем последнюю ', '
        outputWrap.lastChild.remove();
    }
    return outputWrap;
}


// Задать минимульную ширину столбцам в таблице
function calcColumnMinWidth(table) {
    let cellInHeader = '';
    let cellInBody = '';
    if(table.classList.contains('table__wrap')) {
        cellInHeader = table.querySelectorAll('.table__header .table__part:not(.table__part--fixed) .cell');
        cellInBody = table.querySelectorAll('.table__body .table__part:not(.table__part--fixed) .cell');
    } else if(table.classList.contains('table_report__wrap')) {
        cellInHeader = table.querySelectorAll('.table__header .cell');
        cellInBody = table.querySelectorAll('.table__body .cell');
    }
    let cellMinWidth;
    for(let i=0; i<cellInHeader?.length; i++) {
        if(cellInHeader[i].classList.contains('cell--id') || cellInHeader[i].classList.contains('cell--item')) {
            continue;
        }
        cellInHeader[i].style.minWidth = '';
        if(cellInHeader[i].querySelector('.cell__name').offsetHeight > 26) {
            // Если название расположилось в 3 строки, растягиваем столбец, чтобы уместилось в 2 строки
            cellMinWidth = +(getComputedStyle(cellInHeader[i]).minWidth.replace('px',''));
            while(cellInHeader[i].querySelector('.cell__name').offsetHeight > 26) {
                cellMinWidth += 1;
                cellInHeader[i].style.minWidth = cellMinWidth + 'px';
            }
        } else {
            cellMinWidth = cellInHeader[i].querySelector('.cell__name').offsetWidth + +(getComputedStyle(cellInHeader[i]).paddingLeft.replace('px','')) + +(getComputedStyle(cellInHeader[i]).paddingRight.replace('px',''));
        }
        cellInHeader[i].style.minWidth = cellMinWidth + 'px';
        let cellColumn = cellInHeader[i].getAttribute('data-column');
        for(let k=0; k<cellInBody?.length; k++) {
            if(cellInBody[k].getAttribute('data-column') === cellColumn) {
                cellInBody[k].style.minWidth = cellMinWidth + 'px';
            }
        }
    }
}


// Задать ширину столбцам в таблице
function calcColumnWidth(table) {
    let cellInHeader = '';
    let cellInBody = '';
    if(table.classList.contains('table__wrap')) {
        cellInHeader = table.querySelectorAll('.table__header .table__part:not(.table__part--fixed) .cell');
        cellInBody = table.querySelectorAll('.table__body .table__part:not(.table__part--fixed) .cell');
    } else if(table.classList.contains('table_report__wrap')) {
        cellInHeader = table.querySelectorAll('.table__header .cell');
        cellInBody = table.querySelectorAll('.table__body .cell');
    }
    let cellMaxWidth;
    for(let i=0; i<cellInHeader?.length; i++) {
        // Не меняем ширину ячеек с id и названием товара
        if(cellInHeader[i].classList.contains('cell--id') || cellInHeader[i].classList.contains('cell--item')) {
            continue;
        }
        let cellColumn = cellInHeader[i].getAttribute('data-column');
        cellMaxWidth = 0;
        // Получаем ширину самой широкой ячейки тела данного столбца таблицы
        for(let k=0; k<cellInBody?.length; k++) {
            if(cellInBody[k].getAttribute('data-column') === cellColumn) {
                cellInBody[k].style.minWidth = '';
                cellInBody[k].style.width = '';
                cellMaxWidth = cellInBody[k].offsetWidth > cellMaxWidth ? cellInBody[k].offsetWidth : cellMaxWidth;
            }
        }

        cellInHeader[i].style.width = cellMaxWidth + 'px';
        cellInHeader[i].style.minWidth = cellMaxWidth + 'px';

        // Определяем минимальную ширину ячейки в шапке таблицы (отступы по краям + ширина названия ячейки)
        let cellMinWidthForHeader = cellInHeader[i].querySelector('.cell__name').offsetWidth + +(getComputedStyle(cellInHeader[i]).paddingLeft.replace('px','')) + +(getComputedStyle(cellInHeader[i]).paddingRight.replace('px',''));
        cellMaxWidth = cellMinWidthForHeader > cellMaxWidth ? cellMinWidthForHeader : cellMaxWidth;

        cellInHeader[i].style.width = cellMaxWidth + 'px';
        cellInHeader[i].style.minWidth = cellMaxWidth + 'px';

        // Если название в шапке таблицы расположилось в 3 строки, растягиваем столбец, чтобы уместилось в 2 строки
        while(cellInHeader[i].querySelector('.cell__name').offsetHeight > 26) {
            cellMaxWidth += 1;
            cellInHeader[i].style.minWidth = cellMaxWidth + 'px';
            cellInHeader[i].style.width = cellMaxWidth + 'px';
        }

        // Присвпиваем единую ширину всем ячейкам данного столбца
        for(let k=0; k<cellInBody?.length; k++) {
            if(cellInBody[k].getAttribute('data-column') === cellColumn) {
                cellInBody[k].style.width = cellMaxWidth + 'px';
                cellInBody[k].style.minWidth = cellMaxWidth + 'px';
            }
        }
    }
}
if(document.querySelectorAll('.table__wrap').length > 0) {
    const tableWrap = document.querySelectorAll('.table__wrap');
    for(let i=0; i<tableWrap.length; i++) {
        setTimeout(()=>{
            calcColumnWidth(tableWrap[i]);
            // После подсчета ширины столбцов таблицы делаем таблицу видимой
            tableWrap[i].closest('.table').style.opacity = '1';
        }, 400);
    }
}
if(document.querySelectorAll('.table_report__wrap').length > 0) {
    const tableReportWrap = document.querySelectorAll('.table_report__wrap');
    for(let i=0; i<tableReportWrap.length; i++) {
        setTimeout(()=>{
            calcColumnWidth(tableReportWrap[i]);
            // После подсчета ширины столбцов таблицы делаем таблицу видимой
            tableReportWrap[i].style.opacity = '1';
        }, 400);
    }
}


// Выделить строку при наведении на ячейку в ней
const cell = document.querySelectorAll('.table__body .table__cell');
for(let i=0; i<cell?.length; i++) {
    cell[i].addEventListener('mouseenter',()=>{
        const item = cell[i].closest('.item').getAttribute('data-item');
        const itemHovered = cell[i].closest('.table__body').querySelectorAll('.item[data-item="' + item +'"]');
        for(let k=0; k<itemHovered.length; k++) {
            itemHovered[k].classList.add('item--hovered');
        }
    });
    cell[i].addEventListener('mouseleave',()=>{
        const item = cell[i].closest('.item').getAttribute('data-item');
        const itemHovered = document.querySelectorAll('.item[data-item="' + item +'"]');
        for(let k=0; k<itemHovered.length; k++) {
            itemHovered[k].classList.remove('item--hovered');
        }
    });
}


// Открыть окно настройки форм отчета
const customizeFormButton = document.querySelector('.j-customize-form');
const popupShadow = document.querySelector('.wrapper_shadow');
customizeFormButton?.addEventListener('click',()=>{
    popupShadow?.classList.add('wrapper_shadow--active');
    const customizeForm = document.querySelector('.popup--constructor');
    customizeForm?.classList.add('popup--active');
    document.body.style.overflow = 'hidden';
    // Определение необходимости скрытия части списка 
    checkConstructorHeight();
    // Подстановка текущего открытого отчета
    let currentForm = customizeFormButton.closest('.settings__item--form').querySelector('.dropdown__text').value;
    // Сначала поиск по формам по умолчанию
    let formItem = customizeForm.querySelectorAll('.settings__item--form .checkbox__field');
    let formApplied = false;
    for(let i=0; i<formItem?.length; i++) {
        if(formItem[i].nextElementSibling.innerText == currentForm) {
            formItem[i].click();
            formApplied = true;
        }
    }
    // Если не нашли в форме по умолчанию, то ищем в сохраненных формах
    if(!formApplied) {
        let savedFormItem = customizeForm.querySelectorAll('.form_list__item .open-form');
        for(let i=0; i<savedFormItem?.length; i++) {
            if(savedFormItem[i].querySelector('span').innerText == currentForm) {
                savedFormItem[i].click();
            }
        }
    }
});


// Закрытие окон по клику на затемнение фона
popupShadow?.addEventListener('click',()=>{
    // Если открыта форма Настройки форм отчета
    if(document.querySelector('.popup--active').classList.contains('popup--constructor')) {
        clearConstructor(document.querySelector('.popup--active'));
        document.body.style.overflow = '';
    }
    // Если открыта форма Редактирование ссылок
    if(document.querySelector('.popup--active').classList.contains('popup--link-edit')) {
        document.querySelector('.popup--active .j-link-edit-cancel').click();
    }
    if(document.querySelector('.popup--active')?.classList.contains('j-modal-price-adjust-save')) {
        document.querySelector('.popup--active').remove();
    }
    document.querySelector('.popup--active')?.classList.remove('popup--active');
    popupShadow.classList.remove('wrapper_shadow--active');
});


// Закрытие окон по клику на крестик
const popupCloseButton = document.querySelectorAll('.j-popup-close');
for(let i=0; i<popupCloseButton?.length; i++) {
    popupCloseButton[i].addEventListener('click',()=>{
        // Если открыта форма Настройки форм отчета
        if(document.querySelector('.popup--active').classList.contains('popup--constructor')) {
            clearConstructor(document.querySelector('.popup--active'));
            document.body.style.overflow = '';
        }
        // Если открыта форма Редактирование ссылок
        if(document.querySelector('.popup--active').classList.contains('popup--link-edit')) {
            document.querySelector('.popup--active .j-link-edit-cancel').click();
        }
        if(document.querySelector('.popup--active')?.classList.contains('j-modal-price-adjust-save')) {
            document.querySelector('.popup--active').remove();
        }
        document.querySelector('.popup--active')?.classList.remove('popup--active');
        popupShadow.classList.remove('wrapper_shadow--active');
    });
}


// Удалить сохраненную форму
const formDeleteButton = document.querySelectorAll('.j-delete-form');
for(let i=0; i<formDeleteButton?.length; i++) {
    initDeleteButton(formDeleteButton[i]);
}
function initDeleteButton(button) {
    button.addEventListener('click',()=>{
        let formName = button.closest('.form_list__item ').querySelector('.open-form').innerText;
        // Удаляем форму из списка сохраненных
        button.closest('.form_list__item').remove();
        checkSavedForms();
        // Удаляем форму из выпадающих списков "Форма по умолчанию" и "Форма отчета"
        let formList = document.querySelectorAll('.settings__item--form');
        for(let i=0; i<formList?.length; i++) {
            let formItem = formList[i].querySelectorAll('.dropdown__item .checkbox__field');
            for(let k=0; k<formItem?.length; k++) {
                if(formList[i].querySelector('.dropdown__text').value == formName && formItem[k].nextElementSibling.innerText == 'Полный отчет') {
                    formItem[k].click();
                } else if(formItem[k].nextElementSibling.innerText == formName) {
                    formItem[k].closest('.dropdown__item').remove();
                }
            }
        }
    });
}


const savedReports = [
    {
        name: 'report0',
        columns: ['column1', 'column2', 'column3', 'column4', 'column5', 'column6', 'column7', 'column8', 'column9', 'column10', 'column11', 'column12', 'column13', 'column14', 'column15', 'column16', 'column17', 'column18', 'column19', 'column20', 'column21', 'column22', 'column23', 'column24', 'column25', 'column26', 'column27', 'column28', 'column29', 'column30', 'column31', 'column32', 'column33', 'column34', 'column35', 'column36', 'column37', 'column38', 'column39', 'column40', 'column41', 'column42', 'column43', 'column44', 'column45', 'column46', 'column47', 'column48', 'column49', 'column50', 'column51', 'column52', 'column53', 'column54', 'column55', 'column56', 'column57', 'column58']
    },
    {
        name: 'report1',
        columns: ['column1', 'column2', 'column3', 'column4', 'column5', 'column6', 'column7', 'column8', 'column9', 'column17', 'column18', 'column19', 'column20', 'column21', 'column22', 'column23', 'column24', 'column25', 'column26', 'column27', 'column28', 'column29', 'column30', 'column31', 'column32', 'column33', 'column34', 'column35', 'column36', 'column37', 'column38', 'column39', 'column40', 'column41', 'column42', 'column43', 'column50', 'column51', 'column52', 'column53', 'column54', 'column55', 'column57', 'column58']
    },
    {
        name: 'report2',
        columns: ['column1', 'column2', 'column3', 'column4', 'column5', 'column6', 'column7', 'column8', 'column9', 'column10', 'column11', 'column12', 'column13', 'column14', 'column15', 'column16', 'column27', 'column28', 'column29', 'column30', 'column31', 'column32', 'column33', 'column34', 'column35', 'column36', 'column37', 'column38', 'column39', 'column40', 'column41', 'column42', 'column43', 'column44', 'column45', 'column46', 'column47', 'column48', 'column49', 'column50', 'column56', 'column58']
    },
    {
        name: 'report3',
        columns: ['column1', 'column2', 'column3', 'column4', 'column8', 'column9', 'column10', 'column11', 'column18', 'column19', 'column20', 'column21']
    },
    {
        name: 'report4',
        columns: ['column1', 'column2', 'column3', 'column4', 'column5', 'column6', 'column7', 'column12', 'column13', 'column14', 'column15', 'column16', 'column17', 'column22', 'column23', 'column24', 'column25', 'column26', 'column27', 'column28', 'column30', 'column31', 'column33', 'column36', 'column37', 'column38']
    }
];


// Открыть сохраненную форму
const formOpenButton = document.querySelectorAll('.j-open-form');
for(let i=0; i<formOpenButton?.length; i++) {
    initOpenButton(formOpenButton[i]);
}
function initOpenButton(button) {
    button.addEventListener('click',()=>{
        document.querySelector('.form_list__item--active')?.classList.remove('form_list__item--active');
        button.closest('.form_list__item').classList.add('form_list__item--active');
        let reportSelected = button.getAttribute('data-report');
        for(let k=0; k<savedReports?.length; k++) {
            if(savedReports[k].name == reportSelected) {
                let columns = savedReports[k].columns;
                let columnsInTable = document.querySelectorAll('.constructor__checkbox');
                for(let i=0; i<columnsInTable?.length; i++) {
                    columnsInTable[i].querySelector('input').checked = false;
                    let columnType = columnsInTable[i].querySelector('input').getAttribute('name');
                    for(let l=0; l<columns?.length; l++) {
                        if(columns[l].toLowerCase() == columnType.toLowerCase()) {
                            columnsInTable[i].querySelector('input').checked = true;
                        }
                    }
                }
            }
        }
    });
}


// Настройка форм отчета. Скрываем список сохраненных форм, если он пустой
function checkSavedForms() {
    const formSavedList = document.querySelector('.settings__list');
    const formsSaved = formSavedList?.querySelectorAll('.form_list__item');
    if(formsSaved.length === 0) {
        formSavedList.classList.remove('settings__list--active');
    } else {
        formSavedList.classList.add('settings__list--active');
    }
}


// Определение необходимости скрытия части списка в Настройке форм отчета
function checkConstructorHeight() {
    const customizeForm = document.querySelector('.popup--constructor');
    const customizeFormList = customizeForm?.querySelector('.constructor__list_inner');
    const customizeFormWrap = customizeForm?.querySelector('.constructor__body');
    if(customizeFormList?.offsetHeight > customizeFormWrap?.offsetHeight) {
        customizeForm.classList.add('popup--list_hidden');
        controlConstructorShadow(customizeFormWrap);
    } else {
        customizeForm?.classList.remove('popup--list_hidden');
    }
}
window.addEventListener('resize',()=>{
    checkConstructorHeight();
});


// Убираем дымку при прокрутке списка до конца в Настройке форм отчета
function controlConstructorShadow(list) {
    const listInner = list.querySelector('.constructor__list');
    const listGroup = list.querySelector('.constructor__list_inner');
    listInner.addEventListener('scroll', () => {
        const scrollTopInner = Math.round(listInner.scrollTop);
        const scrollTopGroup = Math.round(listGroup.offsetHeight - listInner.offsetHeight);
        if (Math.abs(scrollTopInner - scrollTopGroup) <= 3) {
            list.classList.add('scroll-to-end');
        } else {
            list.classList.remove('scroll-to-end');
        }
    });
}


// Настройка форм отчета. Выбрать все/Отменить все
const constructorCheckboxButton = document.querySelectorAll('.constructor__button');
for(let i=0; i<constructorCheckboxButton?.length; i++) {
    constructorCheckboxButton[i].addEventListener('click',()=>{
        let constructor = constructorCheckboxButton[i].closest('.popup--constructor');
        let constructorCheckbox = constructor.querySelectorAll('.constructor__checkbox .checkbox__field');
        let constructorCheckboxChecked;
        if(constructorCheckboxButton[i].classList.contains('j-constructor-check-all')) {
            constructorCheckboxChecked = true;
        } else if (constructorCheckboxButton[i].classList.contains('j-constructo-clear-all')) {
            constructorCheckboxChecked = false;
        }
        for(let k=0; k<constructorCheckbox?.length; k++) {
            if(constructorCheckbox[k].disabled) continue;
            constructorCheckbox[k].checked = constructorCheckboxChecked;
        }
    });
}


// Настройка форм отчета. Сохранить форму отчета
const newFormSaveButton = document.querySelector('.j-constructor-save-table');
newFormSaveButton?.addEventListener('click',(e)=>{
    e.preventDefault();
    let newFormSaveForm = newFormSaveButton.closest('form');
    let newFormSaveField = newFormSaveForm.querySelector('.constructor__field');
    let ableToSave = true;
    let timerToChangeText;
    if(newFormSaveField.value.trim().length === 0) {
        ableToSave = false;
        newFormSaveForm.classList.add('constructor__form--warning');

        // Снятие подсветки при клике на выделенное поле
        newFormSaveField.addEventListener('click',()=>{
            newFormSaveForm.classList.remove('constructor__form--warning');
            clearTimeout(timerToChangeText);
        });
    }
    if(ableToSave) {
        // Получаем список выбранных колонок
        let constructorColumns = document.querySelectorAll('.constructor__checkbox');
        let checkedColumns = [];
        for(let i=0; i<constructorColumns?.length; i++) {
            if(constructorColumns[i].querySelector('input').checked) {
                checkedColumns.push(constructorColumns[i].querySelector('input').getAttribute('name'));
            }
        }
        let newReport = {
            name: 'report' + (+(document.querySelectorAll('.page_header .settings__item--form .dropdown__item').length)),
            columns: checkedColumns
        };
        savedReports.push(newReport);
        // Добавляем форму в список сохраненных в окне "Настройка форм отчета"
        let listOfSavedForms = newFormSaveButton.closest('.popup--constructor').querySelector('.form_list');
        let newForm = document.createElement('div');
        newForm.className = "form_list__item";
        newForm.innerHTML =  '<button class="open-form j-open-form"><span>' + newFormSaveField.value.charAt(0).toUpperCase() + newFormSaveField.value.substr(1) + '</span></button><button class="delete-form j-delete-form"></button>';
        newForm.querySelector('.open-form').setAttribute('data-report','report' + (+(document.querySelectorAll('.page_header .settings__item--form .dropdown__item').length)));
        listOfSavedForms.append(newForm);
        initDeleteButton(newForm.querySelector('.j-delete-form'));
        initOpenButton(newForm.querySelector('.j-open-form'));
        newForm.querySelector('.j-open-form').click();
        // Добавляем форму в выпадающий список "Форма отчета" над таблицей
        let listOfForms = document.querySelector('.page_header .settings__item--form .list__group');
        let newFormItem = document.createElement('div');
        newFormItem.className = "dropdown__item";
        newFormItem.innerHTML = '<div class="checkbox dropdown__checkbox"><label class="checkbox__label"><input type="radio" name="FORM" class="checkbox__field"><span class="checkbox__box">' + newFormSaveField.value.charAt(0).toUpperCase() + newFormSaveField.value.substr(1) + '</span></label></div>';
        newFormItem.querySelector('.dropdown__checkbox input').setAttribute('data-report','report' + (+(document.querySelectorAll('.page_header .settings__item--form .dropdown__item').length)));
        listOfForms.append(newFormItem);
        initDropdownItem(newFormItem.querySelector('.checkbox__field'));

        newFormSaveField.value = "";
        newFormSaveButton.innerText = 'Сохранено';
        timerToChangeText = setTimeout(()=>{
            newFormSaveButton.innerText = 'Сохранить форму отчета';
        }, 3000);
        checkSavedForms();
    }
});


// Настройка форм отчета. Очистить окно
function clearConstructor(constructor) {
    constructor.querySelector('.j-constructor-clear-all').click();
    constructor.querySelector('.constructor__field').value = '';
    constructor.querySelector('.constructor__form').classList.remove('constructor__form--warning');
}


// Настройка форм отчета. Отмена
const cancelConstructor = document.querySelector('.j-constructor-cancel');
cancelConstructor?.addEventListener('click',()=>{
    cancelConstructor.closest('.popup--constructor').querySelector('.j-popup-close').click();
});


// Настройка форм отчета. Применить
const applyConstructor = document.querySelector('.j-constructor-apply');
applyConstructor?.addEventListener('click',()=>{
    let formTitle = document.querySelectorAll('.form_list__item--active').length > 0 ?
        document.querySelector('.form_list__item--active .open-form span').innerText :
        document.querySelector('.popup--constructor .settings__item--form .dropdown__text').value;
    let formItem = document.querySelectorAll('.page_header .settings__item--form .checkbox__field');
    for(let i=0; i<formItem?.length; i++) {
        formItem[i].checked = false;
        if(formItem[i].nextElementSibling.innerText == formTitle) {
            formItem[i].click();
            //formItem[i].checked = true;
            //document.querySelector('.page__settings .settings__item--form .dropdown__text').value = formTitle;
        }
    }
    applyConstructor.closest('.popup--constructor').querySelector('.j-popup-close').click();
});


// Прокрутка таблицы по стрелкам
const tableArrow = document.querySelectorAll('.table__arrow');
let checkTimeout;
let checkMouseDownInterval;
let tableScrollInterval;
let tableShift = 150;
let startTime;
let endTime;
for(let i=0; i<tableArrow?.length; i++) {
    // Если кнопку зажали более чем на 0.5сек, то таблица скроллится немного пока зажата кнопка
    // Если кнопку кликнули, то таблица скроллится единоразово на большое значение
    tableArrow[i].addEventListener('mousedown',()=>{
        startTime = new Date();
        endTime = 0;
        checkMouseDownInterval = setInterval(()=>{
            endTime = new Date();
            if((endTime - startTime)/1000 > 0.3) {
                if(tableArrow[i].classList.contains('table__arrow--matrix')) {
                    tableArrow[i].closest('.tab_block__table_wrap').querySelector('.tab_block__table').style.transition = 'none';
                } else {
                    tableArrow[i].closest('.table__body').querySelector('.table__inner').style.transition = 'none';
                    tableArrow[i].closest('.table__wrap').querySelector('.table__header .table__inner').style.transition = 'none';
                }
                clearInterval(checkMouseDownInterval);
                tableShift = 1;
                tableScrollInterval = setInterval(()=>{
                    scrollTable(tableArrow[i], tableShift);
                    if(tableArrow[i].classList.contains('table__arrow--matrix')) {
                        checkArrowVisibilityMatrix();
                    } else {
                        checkArrowVisibility();
                    }
                }, 10);
            }
        }, 10);  
    });
    tableArrow[i].addEventListener('mouseup',()=>{
        clearInterval(checkMouseDownInterval);
        clearInterval(tableScrollInterval);
        if(tableArrow[i].classList.contains('table__arrow--matrix')) {
            tableArrow[i].closest('.tab_block__table_wrap').querySelector('.tab_block__table').style.transition = '';
        } else {
            tableArrow[i].closest('.table__body').querySelector('.table__inner').style.transition = '';
            tableArrow[i].closest('.table__wrap').querySelector('.table__header .table__inner').style.transition = '';
        }
    });
    tableArrow[i].addEventListener('click',()=>{
        if((endTime - startTime)/1000 <= 0.3) {
            clearTimeout(checkTimeout);
            tableShift = 150;
    
            scrollTable(tableArrow[i], tableShift);

            // Проверка необходимости отображения стрелок в таблице
            checkTimeout = setTimeout(()=>{
                if(tableArrow[i].classList.contains('table__arrow--matrix')) {
                    checkArrowVisibilityMatrix();
                } else {
                    checkArrowVisibility();
                }
            }, 310);
        }
    });
}
// Прокрутка таблицы
function scrollTable(arrow, shift) {
    let table;
    let tableHeaderж
    if(arrow.classList.contains('table__arrow--matrix')) {
        table = arrow.closest('.tab_block__table_wrap').querySelector('.tab_block__table');
    } else {
        table = arrow.closest('.table__body').querySelector('.table__inner');
        tableHeader = arrow.closest('.table__wrap').querySelector('.table__header .table__inner');
    }
    if(arrow.classList.contains('table__arrow--next')) {
        if(table.getBoundingClientRect().right - table.parentElement.getBoundingClientRect().right < shift) {
            shift = table.getBoundingClientRect().right - table.parentElement.getBoundingClientRect().right;
        }
        shift = -shift;
    } else if(arrow.classList.contains('table__arrow--prev')) {
        if(table.parentElement.getBoundingClientRect().left - table.getBoundingClientRect().left < shift) {
            shift = table.parentElement.getBoundingClientRect().left - table.getBoundingClientRect().left;
        }
    }
    if(arrow.classList.contains('table__arrow--matrix')) {
        table.style.left = +(getComputedStyle(table).left.replace('px','')) + shift + 'px';
    } else {
        table.style.left = +(getComputedStyle(table).left.replace('px','')) + shift + 'px';
        tableHeader.style.left = +(getComputedStyle(table).left.replace('px','')) + shift + 'px';
    }
}

// Проверка необходимости отображения стрелок в таблице
function checkArrowVisibility() {
    const table = document.querySelector('.table__body .table__inner');
    const tableWrap = table?.parentElement;
    const tableBody = table?.closest('.table__body');
    // Сбрасываем стили таблицы к исходным
    tableWrap.closest('.table').querySelector('.table__header .table__part--fixed').classList.remove('table__part--no_shadow');
    tableWrap.closest('.table').querySelector('.table__body .table__part--fixed').classList.remove('table__part--no_shadow');

    if(table.offsetWidth <= tableWrap.offsetWidth) {
        tableBody.querySelector('.table__arrow--prev').classList.add('table__arrow--hidden');
        tableBody.querySelector('.table__arrow--next').classList.add('table__arrow--hidden');
        tableWrap.closest('.table').querySelector('.table__header .table__part--fixed').classList.add('table__part--no_shadow');
        tableWrap.closest('.table').querySelector('.table__body .table__part--fixed').classList.add('table__part--no_shadow');
    } else if(table.getBoundingClientRect().left === tableWrap.getBoundingClientRect().left) {
        tableBody.querySelector('.table__arrow--prev').classList.add('table__arrow--hidden');
        tableBody.querySelector('.table__arrow--next').classList.remove('table__arrow--hidden');
        clearInterval(tableScrollInterval);
    } else if(table.getBoundingClientRect().right === tableWrap.getBoundingClientRect().right) {
        tableBody.querySelector('.table__arrow--next').classList.add('table__arrow--hidden');
        tableBody.querySelector('.table__arrow--prev').classList.remove('table__arrow--hidden');
        clearInterval(tableScrollInterval);
    } else {
        tableBody.querySelector('.table__arrow--prev').classList.remove('table__arrow--hidden');
        tableBody.querySelector('.table__arrow--next').classList.remove('table__arrow--hidden');
        tableWrap.closest('.table').querySelector('.table__header .table__part--fixed').classList.remove('table__part--no_shadow');
        tableWrap.closest('.table').querySelector('.table__body .table__part--fixed').classList.remove('table__part--no_shadow');
    }
}

// Проверка необходимости отображения стрелок в таблице
if(document.querySelectorAll('.table__wrap').length > 0) {
    setTimeout(() => {
        checkArrowVisibility();
    }, 100);
    window.addEventListener('resize',()=>{
        checkArrowVisibility();
    });
}
// Проверка необходимости отображения стрелок в таблице Матрицы скидки
function checkArrowVisibilityMatrix() {
    const table = document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table');
    const tableWrap = table?.parentElement;

    if(table.offsetWidth <= tableWrap.offsetWidth) {
        tableWrap.querySelector('.table__arrow--prev').classList.add('table__arrow--hidden');
        tableWrap.querySelector('.table__arrow--next').classList.add('table__arrow--hidden');
    } else if(table.getBoundingClientRect().left === tableWrap.getBoundingClientRect().left) {
        tableWrap.querySelector('.table__arrow--prev').classList.add('table__arrow--hidden');
        tableWrap.querySelector('.table__arrow--next').classList.remove('table__arrow--hidden');
        clearInterval(tableScrollInterval);
    } else if(table.getBoundingClientRect().right === tableWrap.getBoundingClientRect().right) {
        tableWrap.querySelector('.table__arrow--next').classList.add('table__arrow--hidden');
        tableWrap.querySelector('.table__arrow--prev').classList.remove('table__arrow--hidden');
        clearInterval(tableScrollInterval);
    } else {
        tableWrap.querySelector('.table__arrow--prev').classList.remove('table__arrow--hidden');
        tableWrap.querySelector('.table__arrow--next').classList.remove('table__arrow--hidden');
    }
}
// Проверка необходимости отображения стрелок в таблице Матрицы скидок
if(document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table').length > 0) {
    setTimeout(() => {
        checkArrowVisibilityMatrix();
    }, 100);
    window.addEventListener('resize',()=>{
        checkArrowVisibilityMatrix();
    });
}

// Определение высоты, на которой будут располагаться стрелки в таблице
function checkArrowPositionTop() {
    let table = document.querySelector('.table__inner');
    if(table) {
        let tableArrows = table.closest('.table').querySelectorAll('.table__arrow');
        let tableArrowsTop;
        let tableHeight = table.offsetHeight;
        let tablePositionTop = table.getBoundingClientRect().top;
        let tablePositionBottom = table.getBoundingClientRect().bottom;
        let windowHeight = document.documentElement.clientHeight;
        let windowScrollTop = window.pageYOffset;

        if(tableHeight > windowHeight) {
            if(table.getBoundingClientRect().top > 0) {
                tableArrowsTop = (windowHeight - tablePositionTop)/2;
            } else if(windowHeight > tablePositionBottom) {
                tableArrowsTop = (tablePositionBottom - (-tablePositionTop))/2 + (-tablePositionTop);
                tableArrowsTop = (tableHeight - (-tablePositionTop))/2 + (-tablePositionTop);
            } else {
                tableArrowsTop = windowHeight/2 + (-tablePositionTop);
            }

            for(let i=0; i<tableArrows?.length; i++) {
                tableArrows[i].style.top = tableArrowsTop + 'px';
            }
        } else {
            for(let i=0; i<tableArrows?.length; i++) {
                tableArrows[i].style.top = '';
            }
        }
        for(let i=0; i<tableArrows?.length; i++) {
            setTimeout(()=>{
                tableArrows[i].style.opacity = '1';
            }, 310);
        };
    }
}

// Определение высоты, на которой будут располагаться стрелки в таблице
if(document.querySelectorAll('.table__wrap').length > 0) {
    checkArrowPositionTop();
    window.addEventListener('resize',()=>{
        checkArrowPositionTop();
    });
    window.addEventListener('scroll',()=>{
        checkArrowPositionTop();
    });
}


// Прокрутка таблицы зажатием мыши
let startCursorPosition;
let auxiliaryCursorPosition;
let finalCursorPosition;
let startTablePosition;
let finalTablePosition;
let drag = false;
let dragMove = false;
let tableDraggable = document.querySelector('.table__body .table__inner');
let tableHeader = document.querySelector('.table__header .table__inner');
tableDraggable?.addEventListener('mousedown',(e)=>{
    if(tableDraggable.querySelector('.cell--open .filter') !== e.target
        && !tableDraggable.querySelector('.cell--open .filter')?.contains(e.target)
        && tableDraggable.querySelector('.cell--number.cell--editing') !== e.target
        && !tableDraggable.querySelector('.cell--number.cell--editing')?.contains(e.target)
        && tableDraggable.offsetWidth > tableDraggable.parentElement.offsetWidth) {
        // Не прокручиваем таблицу, если клик идет по открытому окну фильтра или если таблица полностью умещается в окне по ширине или если в таблице меняют значение ячейки
        startCursorPosition = e.pageX;
        drag = true;
        dragMove = false;
        startTablePosition = +(getComputedStyle(tableDraggable).left.replace('px',''));
        tableDraggable.style.transition = 'none';
        tableHeader.style.transition = 'none';
    }
});
tableDraggable?.addEventListener('mousemove',(e)=>{
    auxiliaryCursorPosition = dragMove ? startCursorPosition + 11 : e.pageX;
    if(drag && Math.abs(auxiliaryCursorPosition - startCursorPosition) > 10) {
        // Начинаем двигать таблицу, если курсор сдвинули более, чем на 10px
        dragMove = true;
        finalCursorPosition = e.pageX;
        finalTablePosition = startTablePosition + (finalCursorPosition - startCursorPosition);
        tableDraggable.style.left = finalTablePosition + 'px';
        tableHeader.style.left = finalTablePosition + 'px';
        // Не прокручивать таблицу дальше ее левого края
        if(+(getComputedStyle(tableDraggable).left.replace('px','')) > 0) {
            tableDraggable.style.left = '0px';
            tableHeader.style.left = '0px';
        }
        // Не прокручивать таблицу дальше ее правого края
        if(+(getComputedStyle(tableDraggable).left.replace('px','')) < (tableDraggable.parentElement.offsetWidth - tableDraggable.offsetWidth)) {
            tableDraggable.style.left = tableDraggable.parentElement.offsetWidth - tableDraggable.offsetWidth + 'px';
            tableHeader.style.left = tableDraggable.parentElement.offsetWidth - tableDraggable.offsetWidth + 'px';
        }
        // Пока идет прокрутка таблицы, запрещаем выделение текста
        document.documentElement.style.userSelect = 'none';
        // Проверка необходимости отображения стрелок в таблице
        checkArrowVisibility();
    }
});
document.addEventListener('mouseup',(e)=>{
    drag = false;
    dragMove = false;
    if(tableDraggable) tableDraggable.style.transition = '';
    if(tableHeader) tableHeader.style.transition = '';
    document.documentElement.style.userSelect = '';
});


// Прокрутка таблицы Матрицы скидки зажатием мыши
function initTableMatrixDrag() {
    let startCursorPosition;
    let auxiliaryCursorPosition;
    let finalCursorPosition;
    let startTablePosition;
    let finalTablePosition;
    let drag = false;
    let dragMove = false;
    let tableDraggable = document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table');
    tableDraggable?.addEventListener('mousedown',(e)=>{
        if(tableDraggable.querySelector('.tab_block__table_cell--is-editing') !== e.target
            && !tableDraggable.querySelector('.tab_block__table_cell--is-editing')?.contains(e.target)
            && tableDraggable.querySelector('.group__field') !== e.target
            && !tableDraggable.querySelector('.group__field')?.contains(e.target)
            && tableDraggable.offsetWidth > tableDraggable.parentElement.offsetWidth) {
            // Не прокручиваем таблицу, если клик идет по строке ввода или если таблица полностью умещается в окне по ширине или если в таблице меняют значение ячейки
            startCursorPosition = e.pageX;
            drag = true;
            dragMove = false;
            startTablePosition = +(getComputedStyle(tableDraggable).left.replace('px',''));
            tableDraggable.style.transition = 'none';
        }
    });
    tableDraggable?.addEventListener('mousemove',(e)=>{
        auxiliaryCursorPosition = dragMove ? startCursorPosition + 11 : e.pageX;
        if(drag && Math.abs(auxiliaryCursorPosition - startCursorPosition) > 10) {
            // Начинаем двигать таблицу, если курсор сдвинули более, чем на 10px
            dragMove = true;
            finalCursorPosition = e.pageX;
            finalTablePosition = startTablePosition + (finalCursorPosition - startCursorPosition);
            tableDraggable.style.left = finalTablePosition + 'px';
            // Не прокручивать таблицу дальше ее левого края
            if(+(getComputedStyle(tableDraggable).left.replace('px','')) > 0) {
                tableDraggable.style.left = '0px';
            }
            // Не прокручивать таблицу дальше ее правого края
            if(+(getComputedStyle(tableDraggable).left.replace('px','')) < (tableDraggable.parentElement.offsetWidth - tableDraggable.offsetWidth)) {
                tableDraggable.style.left = tableDraggable.parentElement.offsetWidth - tableDraggable.offsetWidth + 'px';
            }
            // Пока идет прокрутка таблицы, запрещаем выделение текста
            document.documentElement.style.userSelect = 'none';
            // Проверка необходимости отображения стрелок в таблице
            checkArrowVisibilityMatrix();
        }
    });
    document.addEventListener('mouseup',(e)=>{
        drag = false;
        dragMove = false;
        tableDraggable.style.transition = '';
        document.documentElement.style.userSelect = '';
    });
}
if(document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table').length > 0) {
    initTableMatrixDrag();
}


// Разбиение числа на рязряды при вводе в числовые поля ввода
const inputNumber = document.querySelectorAll('input[data-type="number"]');
let settingsTimeOut;
for(let i=0; i<inputNumber?.length; i++) {
    inputNumber[i].addEventListener('keyup',()=>{
        let initialValue = inputNumber[i].value;
        if (!inputNumber[i].validity.valid || initialValue.trim().length == 0) {
            if(inputNumber[i].parentElement.parentElement.classList.contains('wrong-interval')) {
                inputNumber[i].parentElement.parentElement.classList.remove('wrong-interval');
            }
        } else {
            let finalValue = initialValue.replace(/\s/g,'').replace(',','.');
            if(+finalValue > 0) {
                if(inputNumber[i].classList.contains('input--error')) {
                    inputNumber[i].classList.remove('input--error');
                }
                if(inputNumber[i].value.indexOf(',') > 0) {
                    finalValue = initialValue.split(',')[0];
                    finalValue = finalValue.replace(/\s/g,'');
                    finalValue = +finalValue;
                    finalValue = finalValue.toLocaleString('ru');
                    finalValue = finalValue + ',' + initialValue.split(',')[1];
                } else {
                    finalValue = (  +( initialValue.replace(/\s/g,'') )  ).toLocaleString('ru');
                }
                inputNumber[i].value = finalValue;

                // Подсветка полей, если значение ОТ больше значения ДО
                checkInterval(inputNumber[i]);
            } else if (+finalValue === 0) {
                // Подсветка полей, если значение ОТ больше значения ДО
                checkInterval(inputNumber[i]);
            }
        }
        if(inputNumber[i].classList.contains('range__input')) {
            // Проверка необходимости отображения "Очистить фильтр"
            if(checkFilter(inputNumber[i].closest('.filter').querySelectorAll('.filter__range'))) {
                inputNumber[i].closest('.filter').querySelector('.j-filter-clear').classList.add('filter-clear--active');
            } else {
                inputNumber[i].closest('.filter').querySelector('.j-filter-clear').classList.remove('filter-clear--active');
            }
        }
    });
    inputNumber[i].addEventListener('change',()=>{
        if(inputNumber[i].validity.valid && inputNumber[i].value.indexOf(',') > 0 && inputNumber[i].value.indexOf(',') === inputNumber[i].value.length-1) {
            inputNumber[i].classList.add('input--error');
        }
    });
}


// Подсветка полей, если значение ОТ больше значения ДО
function checkInterval(input) {
    let minValue;
    let maxValue;
    if(input.previousElementSibling.innerText == 'от') {
        minValue = +(input.value.replace(/\s/g,'').replace(',','.'));
        maxValue = +(input.parentElement.nextElementSibling.querySelector('input').value.replace(/\s/g,'').replace(',','.'));
        if(maxValue && minValue > maxValue) {
            input.parentElement.parentElement.classList.add('wrong-interval');
        } else {
            input.parentElement.parentElement.classList.remove('wrong-interval');
        }
    } else if(input.previousElementSibling.innerText == 'до') {
        maxValue = +(input.value.replace(/\s/g,'').replace(',','.'));
        minValue = +(input.parentElement.previousElementSibling.querySelector('input').value.replace(/\s/g,'').replace(',','.'));
        if(minValue > maxValue) {
            input.parentElement.parentElement.classList.add('wrong-interval');
        } else {
            input.parentElement.parentElement.classList.remove('wrong-interval');
        }
    }
}


// Обновить
const refreshPageButton = document.querySelectorAll('.j-table-refresh');
for(let i=0; i<refreshPageButton?.length; i++) {
    refreshPageButton[i].addEventListener('click',()=>{
        location.reload();
    });
}


// Очистить фильтры
const clearFilterButton = document.querySelectorAll('.j-filter-clear-all');
let filterClearAll = false;
for(let i=0; i<clearFilterButton?.length; i++) {
    clearFilterButton[i].addEventListener('click',()=>{
        let filterOutput = document.querySelectorAll('.filter_output__item');
        filterClearAll = true;
        for(let k=0; k<filterOutput?.length; k++) {
            filterOutput[k].querySelector('.j-filter_output-clear').click();
        }
        // Сбрасываем сортировку по столбцам
        sortClear();

        filterClearAll = false;
    });
}


// Сброс сортировки по столбцам
function sortClear(){
    let sortedColumns = document.querySelectorAll('.table__cell--sort-applied');
    for(let i=0; i<sortedColumns?.length; i++) {
        let sortCheckbox = sortedColumns[i].querySelectorAll('.sort__item .checkbox__field');
        for(let k=0; k<sortCheckbox?.length; k++) {
            if(sortCheckbox[k].value == 'sort-default') {
                sortCheckbox[k].click();
            }
        }
        sortedColumns[i].querySelector('.filter').setAttribute('data-sort','default');
        sortedColumns[i].classList.remove('table__cell--sort-applied');
    }
}


// Очистить "от-до"
const clearFilterRangeButton = document.querySelectorAll('.j-filter-clear-interval');
for(let i=0; i<clearFilterRangeButton?.length; i++) {
    clearFilterRangeButton[i].addEventListener('click',()=>{
        let filterRangeOutput = document.querySelectorAll('.filter_output__item--range');
        filterClearAll = true;
        for(let k=0; k<filterRangeOutput?.length; k++) {
            filterRangeOutput[k].querySelector('.j-filter_output-clear').click();
        }
        // Сбрасываем сортировку по столбцам
        sortClear();

        filterClearAll = false;
    });
}


// Поисковые строки в фильтрах
function initSearchField() {
    let searchField = document.querySelectorAll('.filter__search .search__field');
    for(let i=0; i<searchField?.length; i++) {
        searchField[i].addEventListener('keyup',()=>{
            let searchFieldValue = searchField[i].value;
            if(searchField[i].closest('.filter').getAttribute('data-filter') == 'search') {
                if(searchFieldValue.trim().length > 0) {
                    searchField[i].closest('.filter').querySelector('.j-filter-clear').classList.add('filter-clear--active');
                } else {
                    searchField[i].closest('.filter').querySelector('.j-filter-clear').classList.remove('filter-clear--active');
                }
            } else if(searchField[i].closest('.filter').getAttribute('data-filter') == 'checkbox') {
                let filterItem = searchField[i].closest('.filter').querySelectorAll('.filter__item .checkbox__box');
                for(let k=0; k<filterItem?.length; k++) {
                    let filterItemValue = filterItem[k].innerText;
                    if(filterItemValue.toLowerCase().indexOf(searchFieldValue.toLowerCase()) > -1) {
                        filterItem[k].closest('.filter__item').style.display = '';
                    } else {
                        filterItem[k].closest('.filter__item').style.display = 'none';
                    }
                }
                // Проверяем необходимость дымки в списке
                checkListHeight(searchField[i].closest('.filter').querySelector('.filter__list'));
                // Если ничего не найдено, показываем текстовую подсказку
                let visibleItems = 0;
                for(let k=0; k<filterItem?.length; k++) {
                    if(getComputedStyle(filterItem[k].closest('.filter__item')).display !== 'none') {
                        visibleItems++;
                    }
                }
                if(visibleItems === 0) {
                    if(searchField[i].closest('.filter').querySelectorAll('.filter__not-found').length === 0) {
                        let hint = document.createElement('p');
                        hint.classList.add('filter__not-found');
                        hint.innerText = "Ничего не найдено"
                        searchField[i].closest('.filter').querySelector('.filter__form').prepend(hint);
                    }
                } else {
                    searchField[i].closest('.filter').querySelector('.filter__not-found')?.remove();
                }
            }
        });
        searchField[i].addEventListener('change',()=>{
            if(searchField[i].closest('.filter').getAttribute('data-filter') == 'checkbox') {
                let searchFieldValue = searchField[i].value;
                let filterItem = searchField[i].closest('.filter').querySelectorAll('.filter__item .checkbox__box');
                for(let k=0; k<filterItem?.length; k++) {
                    let filterItemValue = filterItem[k].innerText;
                    if(filterItemValue.toLowerCase().indexOf(searchFieldValue.toLowerCase()) > -1) {
                        filterItem[k].closest('.filter__item').style.display = '';
                    } else {
                        filterItem[k].closest('.filter__item').style.display = 'none';
                    }
                }
                // Проверяем необходимость дымки в списке
                checkListHeight(searchField[i].closest('.filter').querySelector('.filter__list'));
                // Если ничего не найдено, показываем текстовую подсказку
                let visibleItems = 0;
                for(let k=0; k<filterItem?.length; k++) {
                    if(getComputedStyle(filterItem[k].closest('.filter__item')).display !== 'none') {
                        visibleItems++;
                    }
                }
                if(visibleItems === 0) {
                    if(searchField[i].closest('.filter').querySelectorAll('.filter__not-found').length === 0) {
                        let hint = document.createElement('p');
                        hint.classList.add('filter__not-found');
                        hint.innerText = "Ничего не найдено"
                        searchField[i].closest('.filter').querySelector('.filter__form').prepend(hint);
                    }
                } else {
                    searchField[i].closest('.filter').querySelector('.filter__not-found')?.remove();
                }
            }
        });
    }
}
initSearchField();


// Клик по пагинации
initPagination();
function initPagination() {
    const paginationItem = document.querySelectorAll('.pagination__item');
    for(let i=0; i<paginationItem?.length; i++) {
        paginationItem[i].addEventListener('click',()=>{
            document.querySelector('.pagination__item--current').classList.remove('pagination__item--current');
            paginationItem[i].classList.add('pagination__item--current');
        });
    }
}


// Поисковая строка. Найти
const searchButton = document.querySelector('.j-search__button');
searchButton?.addEventListener('click',(e)=>{
    e.preventDefault();
    let searchFieldValue = searchButton?.closest('.search__form').querySelector('.search__field').value;
    searchButton.closest('.search__form').querySelector('input[type="hidden"]').value = searchFieldValue;
    searchButton.closest('.search__form').querySelector('.search__field').value = '';
});


//Поисковая строка. Отслеживание клика по Enter
const searchMainField = searchButton?.closest('.search__form').querySelector('.search__field');
searchMainField?.addEventListener('keydown', function(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        searchMainField?.closest('.search__form').querySelector('.j-search__button').click();
    }
});


// Поисковая строка. Возврат к предыдущему запросу
const backToPrevRequest = document.querySelectorAll('.j-search-return');
for(let i=0; i<backToPrevRequest?.length; i++) {
    backToPrevRequest[i].addEventListener('click',(e)=>{
        e.preventDefault();
        backToPrevRequest[i].closest('.search__form').querySelector('.search__field').value = backToPrevRequest[i].closest('.search__form').querySelector('input[type="hidden"]').value ? backToPrevRequest[i].closest('.search__form').querySelector('input[type="hidden"]').value : '';
    });
}


// Корректировка цен. Переключение отображения отчета таблицей-блоками
const viewChangeButton = document.querySelectorAll('.view_block');
for(let i=0; i<viewChangeButton?.length; i++) {
    viewChangeButton[i].addEventListener('click',()=>{
        if(!viewChangeButton[i].classList.contains('view_block--active')) {
            let view = viewChangeButton[i].getAttribute('data-view');
            document.querySelector('.view_block--active').classList.remove('view_block--active');
            viewChangeButton[i].classList.add('view_block--active');
            document.querySelector('.price_adjust_block__body--active').classList.remove('price_adjust_block__body--active');
            document.querySelector('.price_adjust_block__body[data-view="' + view + '"]').classList.add('price_adjust_block__body--active');
            if(view === "blocks") {
                checkArrowReportVisibility();
            }
        }
    });
}


// Корректировка цен. Средняя цена
const averagePriceIcon = document.querySelectorAll('.block_info__icon');
for(let i=0; i<averagePriceIcon?.length; i++) {
    averagePriceIcon[i].addEventListener('mouseenter',()=>{
        const averagePriceBlock = averagePriceIcon[i].closest('.blocks_item__info');
        const averagePriceShadow = averagePriceBlock.querySelector('.block_info__shadow');
        if(!averagePriceIcon[i].classList.contains('block_info__icon--disabled')) {
            averagePriceBlock.classList.add('blocks_item__info--hovered');
            // Проверяем расстояние до левого края экрана и в зависимости от этого отображаем попап средних цен
            checkBlockPosition(averagePriceBlock);
        }

        averagePriceShadow.addEventListener('mouseenter',()=>{
            averagePriceBlock.classList.remove('blocks_item__info--hovered');
            averagePriceBlock.querySelector('.block_info__popup').className = 'block_info__popup';
        });
    });
}
// Проверяем расстояние до левого края экрана и в зависимости от этого отображаем попап средних цен
function checkBlockPosition(averagePriceBlock) {
    const reportBlockPopup = averagePriceBlock.querySelector('.block_info__popup');
    const reportBlockIcon = averagePriceBlock.querySelector('.block_info__icon');
    const reportBlockPopupWidth = reportBlockPopup.offsetWidth;
    const reportBlockIconPositionLeft = reportBlockIcon.getBoundingClientRect().right - averagePriceBlock.closest('.price_adjust_block__body').getBoundingClientRect().left;
    if(reportBlockIconPositionLeft > reportBlockPopupWidth) {
        reportBlockPopup.classList.add('block_info__popup--right');
    } else if (reportBlockIconPositionLeft > reportBlockPopupWidth/2) {
        reportBlockPopup.classList.add('block_info__popup--center');
    } else {
        reportBlockPopup.classList.add('block_info__popup--left');
    }
}


// Корректировка цен. Отчет по продажам. Прокрутка таблицы по стрелкам
let reportScrollInterval;
function initReportArrows() {
    const reportArrow = document.querySelectorAll('.blocks_wrap__arrow');
    let checkTimeout;
    let checkMouseDownInterval;
    let tableShift = 150;
    let startTime;
    let endTime;
    for(let i=0; i<reportArrow?.length; i++) {
        // Если кнопку зажали более чем на 0.5сек, то таблица скроллится немного пока зажата кнопка
        // Если кнопку кликнули, то таблица скроллится единоразово на большое значение
        reportArrow[i].addEventListener('mousedown',()=>{
            startTime = new Date();
            endTime = 0;
            checkMouseDownInterval = setInterval(()=>{
                endTime = new Date();
                if((endTime - startTime)/1000 > 0.3) {
                    reportArrow[i].closest('.price_adjust_block__body').querySelector('.blocks_wrap').style.transition = 'none';
                    clearInterval(checkMouseDownInterval);
                    tableShift = 1;
                    reportScrollInterval = setInterval(()=>{
                        scrollReport(reportArrow[i], tableShift);
                        checkArrowReportVisibility();
                    }, 10);
                }
            }, 10);
        });
        reportArrow[i].addEventListener('mouseup',()=>{
            clearInterval(checkMouseDownInterval);
            clearInterval(reportScrollInterval);
            reportArrow[i].closest('.price_adjust_block__body').querySelector('.blocks_wrap').style.transition = '';
        });
        reportArrow[i].addEventListener('click',()=>{
            if((endTime - startTime)/1000 <= 0.3) {
                clearTimeout(checkTimeout);
                tableShift = 150;

                scrollReport(reportArrow[i], tableShift);

                // Проверка необходимости отображения стрелок в таблице
                checkTimeout = setTimeout(()=>{
                    checkArrowReportVisibility();
                }, 310);
            }
        });
    }
}
initReportArrows();


// Корректировка цен. Отчет по продажам. Прокрутка таблицы
function scrollReport(arrow, shift) {
    let report = arrow.closest('.price_adjust_block__body').querySelector('.blocks_wrap');
    if(arrow.classList.contains('blocks_wrap__arrow--next')) {
        if(report.getBoundingClientRect().right - report.parentElement.getBoundingClientRect().right < shift) {
            shift = report.getBoundingClientRect().right - report.parentElement.getBoundingClientRect().right;
        }
        shift = -shift;
    } else if(arrow.classList.contains('blocks_wrap__arrow--prev')) {
        if(report.parentElement.getBoundingClientRect().left - report.getBoundingClientRect().left < shift) {
            shift = report.parentElement.getBoundingClientRect().left - report.getBoundingClientRect().left;
        }
    }
    report.style.left = +(getComputedStyle(report).left.replace('px','')) + shift + 'px';
}


// Корректировка цен. Отчет по продажам. Проверка необходимости отображения стрелок в таблице
function checkArrowReportVisibility() {
    const report = document.querySelector('.blocks_wrap');
    const reportWrap = report?.parentElement;
    if(report.offsetWidth < reportWrap.offsetWidth) {
        reportWrap.querySelector('.blocks_wrap__arrow--prev').classList.add('blocks_wrap__arrow--hidden');
        reportWrap.querySelector('.blocks_wrap__arrow--next').classList.add('blocks_wrap__arrow--hidden');
    } else if(report.getBoundingClientRect().left === reportWrap.getBoundingClientRect().left) {
        reportWrap.querySelector('.blocks_wrap__arrow--prev').classList.add('blocks_wrap__arrow--hidden');
        reportWrap.querySelector('.blocks_wrap__arrow--next').classList.remove('blocks_wrap__arrow--hidden');
        clearInterval(tableScrollInterval);
    } else if(report.getBoundingClientRect().right === reportWrap.getBoundingClientRect().right) {
        reportWrap.querySelector('.blocks_wrap__arrow--next').classList.add('blocks_wrap__arrow--hidden');
        reportWrap.querySelector('.blocks_wrap__arrow--prev').classList.remove('blocks_wrap__arrow--hidden');
        clearInterval(tableScrollInterval);
    } else {
        reportWrap.querySelector('.blocks_wrap__arrow--prev').classList.remove('blocks_wrap__arrow--hidden');
        reportWrap.querySelector('.blocks_wrap__arrow--next').classList.remove('blocks_wrap__arrow--hidden');
    }
}
// Корректировка цен. Отчет по продажам. Проверка необходимости отображения стрелок в таблице
if(document.querySelectorAll('.blocks_wrap').length > 0) {
    checkArrowReportVisibility();
    window.addEventListener('resize',()=>{
        checkArrowReportVisibility();
    });
}


// Корректировка цен. Отчет по продажам. Прокрутка таблицы зажатием мыши
function initReportDrag() {
    let startCursorPosition;
    let auxiliaryCursorPosition;
    let finalCursorPosition;
    let startReportPosition;
    let finalReportPosition;
    let drag = false;
    let dragMove = false;
    let reportDraggable = document.querySelector('.blocks_wrap');
    reportDraggable?.addEventListener('mousedown',(e)=>{
        if(reportDraggable.querySelector('.blocks_item__info--hovered') !== e.target
            && !reportDraggable.querySelector('.blocks_item__info--hovered')?.contains(e.target)
            && reportDraggable.offsetWidth > reportDraggable.parentElement.offsetWidth) {
            // Не прокручиваем таблицу, если клик идет по иконке информации или если таблица полностью умещается в окне по ширине
            startCursorPosition = e.pageX;
            drag = true;
            dragMove = false;
            startReportPosition = +(getComputedStyle(reportDraggable).left.replace('px',''));
            reportDraggable.style.transition = 'none';
        }
    });
    reportDraggable?.addEventListener('mousemove',(e)=>{
        auxiliaryCursorPosition = dragMove ? startCursorPosition + 11 : e.pageX;
        if(drag && Math.abs(auxiliaryCursorPosition - startCursorPosition) > 10) {
            // Начинаем двигать таблицу, если курсор сдвинули более, чем на 10px
            dragMove = true;
            finalCursorPosition = e.pageX;
            finalReportPosition = startReportPosition + (finalCursorPosition - startCursorPosition);
            reportDraggable.style.left = finalReportPosition + 'px';
            // Не прокручивать таблицу дальше ее левого края
            if(+(getComputedStyle(reportDraggable).left.replace('px','')) > 0) {
                reportDraggable.style.left = '0px';
            }
            // Не прокручивать таблицу дальше ее правого края
            if(+(getComputedStyle(reportDraggable).left.replace('px','')) < (reportDraggable.parentElement.offsetWidth - reportDraggable.offsetWidth)) {
                reportDraggable.style.left = reportDraggable.parentElement.offsetWidth - reportDraggable.offsetWidth + 'px';
            }
            // Пока идет прокрутка таблицы, запрещаем выделение текста
            document.documentElement.style.userSelect = 'none';
            // Проверка необходимости отображения стрелок в таблице
            checkArrowReportVisibility();
            // Пока идет прокрутка таблицы, не активируем попап средних цен по наведению
            disableHoveredIcons(dragMove);
        }
    });
    document.addEventListener('mouseup',(e)=>{
        drag = false;
        dragMove = false;
        reportDraggable.style.transition = '';
        document.documentElement.style.userSelect = '';
        disableHoveredIcons(dragMove);
    });
}
if(document.querySelectorAll('.blocks_wrap').length > 0) {
    initReportDrag();
}


// Корректировка цен. Отчет по продажам. Пока идет прокрутка таблицы, не активируем попап средних цен по наведению
function disableHoveredIcons(dragging) {
    const hoveredEl = document.querySelectorAll('.blocks_wrap .block_info__icon');
    for(let i=0; i<hoveredEl?.length; i++) {
        if(dragging) {
            hoveredEl[i].classList.add('block_info__icon--disabled');
        } else {
            hoveredEl[i].classList.remove('block_info__icon--disabled');
        }
    }

}


// Определяем строки, в которых название товара не умещается в ячейку
function checkItemWidth() {
    const itemTitle = document.querySelectorAll('.cell--item .title__inner');
    for(let i=0; i<itemTitle?.length; i++) {
        let textWrap = document.createElement('span');
        textWrap.innerHTML = itemTitle[i].innerText;
        itemTitle[i].innerHTML = '';
        itemTitle[i].prepend(textWrap);
        setTimeout(()=>{
            if(textWrap.offsetWidth > itemTitle[i].offsetWidth) {
                itemTitle[i].closest('.cell').classList.add('cell--hint-active');
            } else {
                itemTitle[i].closest('.cell').classList.remove('cell--hint-active');
            }
            itemTitle[i].innerHTML = '';
            itemTitle[i].innerText = textWrap.innerText;
        }, 300);
    }
}
checkItemWidth();
window.addEventListener('resize',()=>{
    checkItemWidth()
});


// Корректировка цен. Изменение в ячейках таблицы. Чекбоксы
function initEditedCheckbox() {
    const editedCheckbox = document.querySelectorAll('.cell--edited.cell--checkbox .cell__checkbox_field');
    for(let i=0; i<editedCheckbox?.length; i++) {
        editedCheckbox[i].addEventListener('change',()=>{
            const cell = editedCheckbox[i].closest('.cell');
            if(cell.classList.contains('cell--changed')) {
                cell.classList.remove('cell--changed');
            } else {
                cell.classList.add('cell--changed');
            }
            // Проверка на наличе измененных ячеек
            checkEditedCells();
        });
    }
}
initEditedCheckbox();


// Корректировка цен. Проверка на наличие измененных ячеек
function checkEditedCells() {
    const editedCells = document.querySelectorAll('.cell--edited');
    if(editedCells.length > 0) {
        let editedCellsCount = 0;
        for(let i=0; i<editedCells?.length; i++) {
            if(editedCells[i].classList.contains('cell--changed')) {
                editedCellsCount++;
            }
        }
        if(editedCellsCount > 0) {
            document.querySelector('.price_adjust_block[data-block="item"] .price_adjust_block__footer').classList.add('price_adjust_block__footer--changed');
        } else {
            document.querySelector('.price_adjust_block[data-block="item"] .price_adjust_block__footer').classList.remove('price_adjust_block__footer--changed');
        }
    }
}
checkEditedCells();


// Корректировка цен. Замена числовых значений в ячейках
function initNumberCells() {
    const numberCells = document.querySelectorAll('.cell--edited.cell--number');
    for(let i=0; i<numberCells?.length; i++) {
        numberCells[i].addEventListener('click',()=>{
            if(!numberCells[i].classList.contains('cell--editing')) {
                numberCells[i].classList.add('cell--editing');
                const initialValue = numberCells[i].querySelector('.title').innerText;
                const cellField = document.createElement('input');
                cellField.classList.add('cell__input');
                cellField.value = initialValue;
                cellField.setAttribute('type','text');
                if(numberCells[i].hasAttribute('data-type') && numberCells[i].getAttribute('data-type') === 'text_value') {
                    cellField.setAttribute('pattern','[0-9]{0,}');
                } else {
                    cellField.setAttribute('pattern','([0-9]{0,}\\s){0,}\\d+(,\\d{0,2})?');
                    cellField.addEventListener('keyup',(e)=>{
                        if(e.keyCode === 13) {
                            cellField.blur();
                        } else {
                            let initialValue = cellField.value;
                            if (cellField.validity.valid && cellField.value.trim().length > 0) {
                                let finalValue = initialValue.replace(/\s/g,'').replace(',','.');
                                if(+finalValue > 0) {
                                    if(cellField.value.indexOf(',') > 0) {
                                        finalValue = initialValue.split(',')[0];
                                        finalValue = finalValue.replace(/\s/g,'');
                                        finalValue = +finalValue;
                                        finalValue = finalValue.toLocaleString('ru');
                                        finalValue = finalValue + ',' + initialValue.split(',')[1];
                                    } else {
                                        finalValue = (  +( initialValue.replace(/\s/g,'') )  ).toLocaleString('ru');
                                    }
                                    cellField.value = finalValue;
                                }
                            }
                        }
                    });
                }
                numberCells[i].querySelector('.cell__body').append(cellField);
                cellField.focus();

                cellField.addEventListener('blur',()=>{
                    const initialValue = numberCells[i].getAttribute('data-initial-value');
                    const currentValue = cellField.value.trim().length === 0 ? '0' : cellField.value;
                    if(initialValue !== currentValue) {
                        numberCells[i].classList.add('cell--changed');
                    } else {
                        numberCells[i].classList.remove('cell--changed');
                    }

                    if(!cellField.validity.valid) {
                        numberCells[i].classList.add('cell--invalid');
                    } else {
                        numberCells[i].classList.remove('cell--invalid');
                    }

                    // Проверка на наличие измененных ячеек
                    checkEditedCells();

                    numberCells[i].classList.remove('cell--editing');
                    numberCells[i].querySelector('.title').innerText = currentValue;
                    cellField.remove();

                    // Определение формулы для расчета маржи
                    calculateMarginIncome(numberCells[i]);

                    // Пересчет ширины столбцов с учетом нового содержимого ячеек
                    const tableWrap = document.querySelectorAll('.table__wrap');
                    for(let i=0; i<tableWrap.length; i++) {
                        setTimeout(()=>{
                            //calcColumnMinWidth(tableWrap[i]);
                            calcColumnWidth(tableWrap[i]);
                        }, 200);
                    }
                });
            }
        });
    }
}
initNumberCells();


// Определение формулы для расчета маржи
function calculateMarginIncome(cell) {
    if(cell.classList.contains('cell--priceListPrice') || cell.classList.contains('cell--priceMoscow')) {
        // Расчет Маржа Мск
        calculateMarginMoscow(cell.closest('.item'));
    }
    if(cell.classList.contains('cell--priceListPrice') || cell.classList.contains('cell--priceSpb')) {
        // Расчет Маржа Спб
        calculateMarginSpb(cell.closest('.item'));
    }
    if(cell.classList.contains('cell--quantity')) {
        // Определение цвета строки
        checkRowColor(cell.closest('.item'));
    }
}
// Расчет Маржа Мск
function calculateMarginMoscow(item){
    let marginMoscow;
    const priceMoscow = Number(item.querySelector('.cell--priceMoscow .title').innerText.replace(/\s/g,''));
    const quantityMain = Number(item.querySelector('.cell--warehouseMainQuantity .title').innerText.replace(/\s/g,''));
    const ordersActive = Number(item.querySelector('.cell--ordersMoscowActive .title').innerText.replace(/\s/g,''));
    const costMain = Number(item.querySelector('.cell--warehouseMainPrice .title').innerText.replace(/\s/g,''));
    const priceLisrPrice = Number(item.querySelector('.cell--priceListPrice .title').innerText.replace(/\s/g,''));
    const pricePurchase = quantityMain > ordersActive ? costMain : priceLisrPrice;
    marginMoscow = priceMoscow - pricePurchase;
    if(marginMoscow < 300) {
        item.querySelector('.cell--marginMoscow').classList.add('cell--red');
        item.querySelector('.cell--marginMoscow').classList.remove('cell--dimgrey');
        item.querySelector('.cell--marginMoscow').classList.remove('cell--orange');
    } else if(marginMoscow < 500) {
        item.querySelector('.cell--marginMoscow').classList.add('cell--orange');
        item.querySelector('.cell--marginMoscow').classList.remove('cell--red');
        item.querySelector('.cell--marginMoscow').classList.remove('cell--dimgrey');
    } else {
        item.querySelector('.cell--marginMoscow').classList.remove('cell--red');
        item.querySelector('.cell--marginMoscow').classList.remove('cell--orange');
        item.querySelector('.cell--marginMoscow').classList.add('cell--dimgrey');
    }
    marginMoscow = marginMoscow.toLocaleString('ru');
    item.querySelector('.cell--marginMoscow .title').innerText = marginMoscow;
}
// Расчет Маржа Спб
function calculateMarginSpb(item){
    let marginSpb;
    const priceSpb = Number(item.querySelector('.cell--priceSpb .title').innerText.replace(/\s/g,''));
    const quantitySpb = Number(item.querySelector('.cell--warehouseSpbQuantity .title').innerText.replace(/\s/g,''));
    const quantityMain = Number(item.querySelector('.cell--warehouseMainQuantity .title').innerText.replace(/\s/g,''));
    const ordersActiveSpb = Number(item.querySelector('.cell--ordersSpbActive .title').innerText.replace(/\s/g,''));
    const ordersActiveMain = Number(item.querySelector('.cell--ordersMoscowActive .title').innerText.replace(/\s/g,''));
    const costMainSpb = Number(item.querySelector('.cell--warehouseSpbPrice .title').innerText.replace(/\s/g,''));
    const costMain = Number(item.querySelector('.cell--warehouseMainPrice .title').innerText.replace(/\s/g,''));
    const priceLisrPrice = Number(item.querySelector('.cell--priceListPrice .title').innerText.replace(/\s/g,''));
    const pricePurchase = quantitySpb > ordersActiveSpb ? costMainSpb : quantityMain > ordersActiveMain ? costMain : priceLisrPrice;
    marginSpb = priceSpb - pricePurchase;
    if(marginSpb < 300) {
        item.querySelector('.cell--marginSpb').classList.add('cell--red');
        item.querySelector('.cell--marginSpb').classList.remove('cell--olive');
        item.querySelector('.cell--marginSpb').classList.remove('cell--orange');
    } else if(marginSpb < 500) {
        item.querySelector('.cell--marginSpb').classList.add('cell--orange');
        item.querySelector('.cell--marginSpb').classList.remove('cell--olive');
        item.querySelector('.cell--marginSpb').classList.remove('cell--red');
    } else {
        item.querySelector('.cell--marginSpb').classList.remove('cell--red');
        item.querySelector('.cell--marginSpb').classList.remove('cell--orange');
        item.querySelector('.cell--marginSpb').classList.add('cell--olive');
    }
    marginSpb = marginSpb.toLocaleString('ru');
    item.querySelector('.cell--marginSpb .title').innerText = marginSpb;
}
// Определение цвета строки
function checkRowColor(item) {
    const itemID = item.getAttribute('data-item');
    const quantity = Number(item.querySelector('.cell--quantity .title').innerText.replace(/\s/g,''));
    const quantityWarehouse = Number(item.querySelector('.cell--warehouseMainQuantity .title').innerText.replace(/\s/g,''));
    const quantityUndefined = Number(item.querySelector('.cell--ordersMoscowUndefined .title').innerText.replace(/\s/g,''));
    let rowColor;
    if(quantity === 0) {
        rowColor = 'table__row--grey';
    } else if(quantityUndefined  > quantityWarehouse || quantityWarehouse < 1) {
        rowColor = 'table__row--cornflower';
    }
    const rows = document.querySelectorAll('.price_adjust_block[data-block="item"] .item[data-item="' + itemID + '"]');
    for(let i=0; i<rows?.length; i++) {
        rows[i].classList.remove('table__row--grey');
        rows[i].classList.remove('table__row--cornflower');
        if(rowColor) {
            rows[i].classList.add(rowColor);
        }
    }
}


// Корректировка цен. Сохранить изменения
function initSavePriceAdjustButton() {
    const savePriceAdjustButton = document.querySelectorAll('.j-save-price-adjust');
    for(let i=0; i<savePriceAdjustButton?.length; i++) {
        savePriceAdjustButton[i].addEventListener('click',()=>{
            const block = document.querySelector('.price_adjust_block');
            const rows = block.querySelectorAll('.table__inner [data-item]');
            for(let i=0; i<rows?.length; i++) {
                const cols = rows[i].querySelectorAll('.cell--changed');

                if (cols.length) {
                    for(let i=0; i<cols?.length; i++) {
                        const col = cols[i];
                        const colType = col.classList.contains('cell--number') ? 'number' : col.classList.contains('cell--list') ? 'list' : 'checkbox';
                        let val = null;

                        switch (colType) {
                            case 'number' : {
                                val = col.querySelector('.title').innerText;
                                col.setAttribute('data-initial-value', val);
                                break;
                            }
                            case 'list' : {
                                val = col.querySelector('.dropdown__text').innerText;
                                col.setAttribute('data-initial-value', val);
                                break;
                            }
                            case 'checkbox' : {
                                val = col.querySelector('input[type="checkbox"]').checked;
                                break;
                            }
                        }
                    }
                }
            }
            document.querySelector('.price_adjust_block[data-block="item"] .price_adjust_block__footer').classList.remove('price_adjust_block__footer--changed');
            let changedCells = document.querySelectorAll('.price_adjust_block[data-block="item"] .cell--edited');
            for(let b=0;b<changedCells?.length;b++) {
                if(changedCells[b].classList.contains('cell--changed')) {
                    changedCells[b].classList.remove('cell--changed');
                }
            }
        });
    }
}
initSavePriceAdjustButton();


// Корректировка цен. Отмена всех изменений
function initCancelPriceAdjustButton() {
    const cancelPriceAdjustButton = document.querySelectorAll('.j-cancel-price-adjust');
    for(let i=0; i<cancelPriceAdjustButton?.length; i++) {
        cancelPriceAdjustButton[i].addEventListener('click',()=>{
            resetPriceAdjust();
        });
    }
}
initCancelPriceAdjustButton();


// Корректировка цен. Сброс таблицы к исходному состоянию
function resetPriceAdjust() {
    const cellsEdited = document.querySelectorAll('.cell--changed');
    for(let i=0; i<cellsEdited?.length; i++) {
        const cellEditedType = cellsEdited[i].classList.contains('cell--number') ? 'number' : cellsEdited[i].classList.contains('cell--list') ? 'list' : 'checkbox';
        switch (cellEditedType) {
            case 'number' :
                cellsEdited[i].querySelector('.title').innerText = cellsEdited[i].getAttribute('data-initial-value');
                break;
            case 'list' :
                const listVar = cellsEdited[i].querySelectorAll('.checkbox__field');
                for(let k=0; k<listVar?.length; k++) {
                    if(listVar[k].getAttribute('data-value') === cellsEdited[i].getAttribute('data-initial-value')) {
                        listVar[k].click();
                    }
                }
                break;
            case 'checkbox' :
                cellsEdited[i].querySelector('.cell__checkbox_field').checked = cellsEdited[i].querySelector('.cell__checkbox_field').checked ? false : true;
                break;
        }
        cellsEdited[i].classList.remove('cell--changed');
    }
    if(document.querySelector('.price_adjust_block[data-block="item"] .price_adjust_block__footer')) {
        document.querySelector('.price_adjust_block[data-block="item"] .price_adjust_block__footer').classList.remove('price_adjust_block__footer--changed');
    }
}
resetPriceAdjust();


// Корректировка цен. Скрыть Мск
function initHideMskButton() {
    const hideMskButton = document.querySelectorAll('.checkbox__field[name="HIDE_MOS"]');
    for(let i=0; i<hideMskButton?.length; i++) {
        hideMskButton[i].addEventListener('change',()=>{
            const mskCells = document.querySelectorAll('.table__wrap .cell[data-msk="true"]');
            const tableWrap = document.querySelectorAll('.table__wrap');
            for(let k=0; k<tableWrap.length; k++) {
                // Прокручивааем таблицу к началу
                let innerTable = tableWrap[k].querySelectorAll('.table__inner');
                for(let l=0; l<innerTable?.length; l++) {
                    innerTable[l].style.transition = 'none';
                    innerTable[l].style.left = '';
                }
            }
            for(let k=0; k<mskCells?.length; k++) {
                if(hideMskButton[i].checked) {
                    mskCells[k].classList.add('cell--hidden');

                } else {
                    mskCells[k].classList.remove('cell--hidden');
                }
            }
            for(let k=0; k<tableWrap.length; k++) {
                // Запускаем пересчет ширины ячеек
                calcColumnWidth(tableWrap[k]);
                let innerTable = tableWrap[k].querySelectorAll('.table__inner');
                for(let l=0; l<innerTable?.length; l++) {
                    innerTable[l].style.transition = '';
                }
            }
            setTimeout(()=>{
                // Проверка необходимости отображения стрелок в таблице
                checkArrowVisibility();
            }, 100);
        });
    }
}
initHideMskButton();


// Корректировка цен. Редактирование ссылок
function initLinkEditButton() {
    const linkEditButton = document.querySelectorAll('.j-edit-link');
    for(let i=0; i<linkEditButton?.length; i++) {
        linkEditButton[i].addEventListener('click',()=>{
            popupShadow?.classList.add('wrapper_shadow--active');
            const linkEditPopup = document.querySelector('.popup--link-edit');
            linkEditPopup?.classList.add('popup--active');
        });
    }
}
initLinkEditButton();


// Меняем высоту textarea в зависимости от введенного текста
const textarea = document.querySelectorAll('.textarea--calc-height');
for(let i=0; i<textarea?.length; i++) {
    textareaHeightCorrection(textarea[i]);
}
function textareaHeightCorrection(textarea) {
    textarea.addEventListener('input',()=>{
        textarea.style.height = '';
        textarea.style.height = textarea.scrollHeight + 'px';
    });
}


// Корректировка цен. Редактирование ссылок. Проверка на ввод textarea
const textareaLinkEdit = document.querySelectorAll('.popup--link-edit .popup__field_textarea');
for(let i=0; i<textareaLinkEdit?.length; i++) {
    initTextareaLinkEdit(textareaLinkEdit[i]);
}
function initTextareaLinkEdit(textarea) {
    textarea.addEventListener('input',()=>{
        if(textarea.value.trim().length > 0) {
            textarea.closest('.popup__field_textarea_wrap').classList.add('popup__field_textarea_wrap--not-empty');
        } else {
            textarea.closest('.popup__field_textarea_wrap').classList.remove('popup__field_textarea_wrap--not-empty');
        }
    });
}


// Корректировка цен. Редактирование ссылок. Очистить textarea
const clearTextareaButton = document.querySelectorAll('.j-textarea-clear');
for(let i=0; i<clearTextareaButton?.length; i++) {
    initClearTextareaButton(clearTextareaButton[i]);
}
function initClearTextareaButton(clearButton) {
    clearButton.addEventListener('click',()=>{
        const textareaToClear = clearButton.closest('.popup__field_textarea_wrap').querySelector('.popup__field_textarea');
        textareaToClear.value = '';
        clearButton.closest('.popup__field_textarea_wrap').classList.remove('popup__field_textarea_wrap--not-empty');
        // Корректируем высоту textarea
        textareaToClear.style.height = '';
        textareaToClear.style.height = textareaToClear.scrollHeight + 'px';
        let textareaFields = clearButton.closest('.popup__field').querySelectorAll('.popup__field_textarea_wrap');
        for(let i=1; i<textareaFields?.length; i++) {
            textareaFields[i].remove();
        }
    });
}


// Корректировка цен. Редактирование ссылок. Добавить ссылку
const addLink = document.querySelectorAll('.j-add-link');
for(let i=0; i<addLink?.length; i++) {
    addLink[i].addEventListener('click',()=>{
        let newLink = document.createElement('div');
        newLink.className = 'popup__field_textarea_wrap';
        newLink.innerHTML = '<textarea name="LINK_EDIT_MARKET" class="popup__field_textarea textarea--calc-height" placeholder="Введите ссылку..."></textarea><button class="textarea-clear j-textarea-clear"></button>';
        // Активируем кнопку очистки поля
        initClearTextareaButton(newLink.querySelector('.j-textarea-clear'));
        //Проверка на ввод textarea
        initTextareaLinkEdit(newLink.querySelector('.popup__field_textarea'));
        // Меняем высоту textarea в зависимости от введенного текста
        textareaHeightCorrection(newLink.querySelector('.textarea--calc-height'));

        addLink[i].closest('.popup__field').append(newLink);
    });
}


// Корректировка цен. Редактирование ссылок. Сохранить
const linkEditSaveButton = document.querySelectorAll('.j-link-edit-save');
for(let i=0; i<linkEditSaveButton?.length; i++) {
    linkEditSaveButton[i].addEventListener('click',()=>{
        let fieldsWrap = document.querySelectorAll('.popup--active .popup__field');
        for(let k=0; k<fieldsWrap?.length; k++) {
            let fieldsInWrap = fieldsWrap[k].querySelectorAll('.popup__field_textarea');
            for(let m=0; m<fieldsInWrap?.length;m++) {
                fieldsInWrap[m].value = '';
                if(m > 0 && fieldsInWrap[m].parentElement.querySelector('.j-textarea-clear')) {
                    fieldsInWrap[m].parentElement.querySelector('.j-textarea-clear').click();
                }
            }
        }
        document.querySelector('.popup--active')?.classList.remove('popup--active');
        popupShadow?.classList.remove('wrapper_shadow--active');
    });
}


// Корректировка цен. Редактирование ссылок. Отмена
const linkEditCancelButton = document.querySelectorAll('.j-link-edit-cancel');
for(let i=0; i<linkEditCancelButton?.length; i++) {
    linkEditCancelButton[i].addEventListener('click',()=>{
        let fieldsWrap = document.querySelectorAll('.popup--active .popup__field');
        for(let k=0; k<fieldsWrap?.length; k++) {
            let fieldsInWrap = fieldsWrap[k].querySelectorAll('.popup__field_textarea');
            for(let m=0; m<fieldsInWrap?.length;m++) {
                fieldsInWrap[m].value = '';
                if(m > 0 && fieldsInWrap[m].parentElement.querySelector('.j-textarea-clear')) {
                    fieldsInWrap[m].parentElement.querySelector('.j-textarea-clear').click();
                }
            }
        }
        document.querySelector('.popup--active').classList.remove('popup--active');
        popupShadow?.classList.remove('wrapper_shadow--active');
    });
}


// Регулярные данные. Переключение по вкладкам
const tabItem = document.querySelectorAll('.tab');
for(let i=0; i<tabItem?.length; i++) {
    tabItem[i].addEventListener('click',()=>{
        if(!tabItem[i].classList.contains('tab--active')) {
            document.querySelector('.tab--active')?.classList.remove('tab--active');
            tabItem[i].classList.add('tab--active');
            const tabType = tabItem[i].getAttribute('data-tab');
            document.querySelector('.tab_block--active')?.classList.remove('tab_block--active');
            document.querySelector('.tab_block[data-tab-block="' + tabType + '"]')?.classList.add('tab_block--active');
            if(tabType === 'discounts' && document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table').length > 0) {
                // Задание ширины ячейкам таблицы
                checkMatrixTable();
                // Проверка необходимости отображения стрелок
                checkArrowVisibilityMatrix();
            }
        }
    });
}


// Регулярные данные. Комиссия на Яндекс Маркете ДБС. Удалить строку
const deleteCommissionYM = document.querySelectorAll('.j-delete-commission-row');
for(let i=0; i<deleteCommissionYM?.length; i++) {
    initDeleteCommissionYM(deleteCommissionYM[i]);
}
function initDeleteCommissionYM(button) {
    button.addEventListener('click',()=>{
        button.closest('.tab_block__table_row').remove();
    });
}


// Регулярные данные. Комиссия на Яндекс Маркете ДБС. Удалить группу
const deleteCommissionGroupYM = document.querySelectorAll('.j-delete-commission-group');
for(let i=0; i<deleteCommissionGroupYM?.length; i++) {
    initDeleteCommissionGroupYM(deleteCommissionGroupYM[i]);
}
function initDeleteCommissionGroupYM(button) {
    button.addEventListener('click',()=>{
        button.closest('.tab_block__table_body').remove();
    });
}


// Регулярные данные. % комиссии по категориям. Удалить
const deleteCommissionCategory = document.querySelectorAll('.j-delete-commission-category');
for(let i=0; i<deleteCommissionCategory?.length; i++) {
    initDeleteCommissionCategory(deleteCommissionCategory[i]);
}
function initDeleteCommissionCategory(button) {
    button.addEventListener('click',()=>{
        button.closest('.tab_block__table_row').remove();
    });
}


// Регулярные данные. Поставщики. Добавить
const addSupplier = document.querySelectorAll('.j-add-supplier');
for(let i=0; i<addSupplier?.length; i++) {
    initAddSupplier(addSupplier[i]);
}
function initAddSupplier(button) {
    button.addEventListener('click',()=>{
        const supplierPlaceholder = 'Введите поставщика...';
        const supplierName = 'SUPPLIER';
        let supplierField = createField(supplierPlaceholder, supplierName);
        // Добавление поля для ввода поставщика
        button.closest('.tab_block__table').append(supplierField);
        supplierField.querySelector('input').focus();
        // Прокрутка, если поле ввода не до конца видно
        scrollToNewField(supplierField, supplierField.closest('.tab_block'));
        // Инициализация кнопки удаления поля ввода
        initClearField(supplierField.querySelector('.j-clear-field'));
        // Инициализация поля ввода
        addRowFromField(supplierField.querySelectorAll('input'));
    });
}


// Регулярные данные. Поставщики. Удалить
const deleteSupplier = document.querySelectorAll('.j-delete-supplier');
for(let i=0; i<deleteSupplier?.length; i++) {
    initDeleteSupplier(deleteSupplier[i]);
}
function initDeleteSupplier(button) {
    button.addEventListener('click',()=>{
        button.closest('.tab_block__table_row').remove();
    });
}


// Регулярные данные. Правило “Скидка на залежавшийся товар”. Удалить группу
const deleteDiscountGroup = document.querySelectorAll('.j-delete-discount-group');
for(let i=0; i<deleteDiscountGroup?.length; i++) {
    initDeleteDiscountGroup(deleteDiscountGroup[i]);
}
function initDeleteDiscountGroup(button) {
    button.addEventListener('click',()=>{
        const groupName = button.closest('.tab_block__group').querySelector('.group__title').innerText;
        const groupsInDropdown = button.closest('.tab_block').querySelectorAll('.tab_block__right .dropdown .dropdown__item');
        for(let i=0; i<groupsInDropdown?.length; i++) {
            if(groupsInDropdown[i].querySelector('.checkbox__box').innerText === groupName) {
                groupsInDropdown[i].remove();
            }
        }
        if(button.closest('.tab_block').querySelector('.tab_block__right .dropdown .dropdown__text').value === groupName &&
            button.closest('.tab_block').querySelectorAll('.tab_block__right .dropdown .dropdown__item').length > 0) {
            button.closest('.tab_block').querySelectorAll('.tab_block__right .dropdown .checkbox__field')[0].click();
        } else if(button.closest('.tab_block').querySelectorAll('.tab_block__right .dropdown .dropdown__item').length === 0) {
            button.closest('.tab_block').querySelector('.tab_block__right').classList.add('tab_block__right--hidden');
        }
        button.closest('.tab_block__group').remove();
    });
}


// Регулярные данные. Правило “Скидка на залежавшийся товар”. Добавить группу
const addGroupDiscount = document.querySelectorAll('.j-add-discount-group');
for(let i=0; i<addGroupDiscount?.length; i++) {
    initAddGroupDiscount(addGroupDiscount[i]);
}
function initAddGroupDiscount(button) {
    button.addEventListener('click',()=>{
        const groupPlaceholder = 'Введите название группы...';
        const groupName = 'GROUP_DISCOUNT';
        let groupField = createField(groupPlaceholder, groupName);
        // Добавление поля для ввода названия группы
        button.closest('.tab_block__left').append(groupField);
        groupField.querySelector('input').focus();
        // Прокрутка, если поле ввода не до конца видно
        scrollToNewField(groupField, groupField.closest('.tab_block__left'));
        // Инициализация кнопки удаления поля ввода
        initClearField(groupField.querySelector('.j-clear-field'));
        // Инициализация поля ввода
        addRowFromField(groupField.querySelectorAll('input'));
    });
}


// Регулярные данные. Правило “Скидка на залежавшийся товар”. Добавить ID
const addKeyword = document.querySelectorAll('.j-add-discount-id');
for(let i=0; i<addKeyword?.length; i++) {
    initAddKeyword(addKeyword[i]);
}
function initAddKeyword(button) {
    button.addEventListener('click',()=>{
        const keywordPlaceholder = 'Введите ID...';
        const keywordName = 'KEYWORD';
        let keywordField = createField(keywordPlaceholder, keywordName);
        // Добавление поля для ввода ID
        button.closest('.tab_block__group').querySelector('.group__body').append(keywordField);
        keywordField.querySelector('input').focus();
        // Прокрутка, если поле ввода не до конца видно
        scrollToNewField(keywordField, keywordField.closest('.tab_block__left'));
        // Инициализация кнопки удаления поля ввода
        initClearField(keywordField.querySelector('.j-clear-field'));
        // Инициализация поля ввода
        addRowFromField(keywordField.querySelectorAll('input'));
    });
}


// Добавление поля для ввода новых данных
function createField(placeholder, name) {
    const field = document.createElement('div');
    field.classList.add('group__field');
    field.innerHTML = '<label><input type="text" placeholder="' + placeholder + '" name="' + name + '" data-field="' + name.toLowerCase() + '"></label>' +
        '<div class="group__field_clear j-clear-field"></div>';
    return field;
}


// Добавление слова после ввода в поле
function addRowFromField(field) {
    for(let i=0; i<field?.length; i++) {
        field[i].addEventListener('keyup',(e)=>{
            if (e.keyCode === 13) {
                e.preventDefault();
                const fieldType = field[i].getAttribute('data-field');
                let deleteField = false;
                let word;
                switch (fieldType) {
                    case 'keyword':
                        word = field[i].value.trim();
                        if(word.length !== 0) {
                            let idUniquenessDiscount = checkIdUniquenessDiscount(field[i]);
                            if(idUniquenessDiscount) {
                                let newKeyword = createKeywordBlock(word);
                                // Добавление ID
                                field[i].closest('.tab_block__group').querySelector('.group__keywords').append(newKeyword);
                                // Инициализация кнопки удаления
                                initDeleteKeyword(newKeyword.querySelector('.j-delete-keyword'));
                                // Проверка наличия ID в группе
                                checkKeywordLength(newKeyword.closest('.tab_block__group'));
                                deleteField = true;
                            } else if(document.querySelector('.popup--warning')) {
                                document.querySelector('.popup--warning .warning__title').innerText = 'Данный ID уже добавлен';
                                document.querySelector('.popup--warning').classList.add('popup--active');
                                popupShadow?.classList.add('wrapper_shadow--active');
                                field[i].closest('.group__field').classList.add('group__field--warning');
                            }
                        } else if(document.querySelector('.popup--warning')) {
                            document.querySelector('.popup--warning .warning__title').innerText = 'Не указан ID';
                            document.querySelector('.popup--warning').classList.add('popup--active');
                            popupShadow?.classList.add('wrapper_shadow--active');
                        }
                        break;
                    case 'supplier':
                        word = field[i].value.trim();
                        if(word.length !== 0) {
                            let newSupplier = createSupplierBlock(word);
                            // Добавление поставщика
                            field[i].closest('.tab_block__table').querySelector('.tab_block__table_body').append(newSupplier);
                            // Инициализация кнопки удаления
                            initDeleteSupplier(newSupplier.querySelector('.j-delete-supplier'));
                            // Инициализация редактирования ячейки
                            initEditingCell(newSupplier.querySelectorAll('.tab_block__table_cell--edit'));
                            deleteField = true;
                        }
                        break;
                    case 'group_discount':
                        word = field[i].value.trim();
                        if(word.length !== 0) {
                            let newGroupDiscount = createGroupDiscount(word);
                            // Добавление группы
                            if (field[i].closest('.tab_block__left').querySelectorAll('.tab_block__group').length > 0) {
                                field[i].closest('.tab_block__left').querySelectorAll('.tab_block__group')[field[i].closest('.tab_block__left').querySelectorAll('.tab_block__group').length - 1].after(newGroupDiscount);
                            } else {
                                field[i].closest('.tab_block__left').querySelector('.tab_block__headgroup').after(newGroupDiscount);
                            }
                            // Добавление группы в dropdown для матрицы скидок
                            const dropdownItem = document.createElement('div');
                            dropdownItem.className = 'dropdown__item';
                            dropdownItem.innerHTML = '<div class="dropdown__item">' +
                                '<div class="checkbox dropdown__checkbox">' +
                                '<label class="checkbox__label">' +
                                '<input type="radio" name="PRODUCT_GROUP" class="checkbox__field">' +
                                '<span class="checkbox__box">' + word + '</span>' +
                                '</label>' +
                                '</div>' +
                                '</div>';
                            document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__dropdown .list__group').append(dropdownItem);
                            initDropdownItem(dropdownItem.querySelector('.checkbox__field'));
                            if(document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right').classList.contains('tab_block__right--hidden')) {
                                document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right').classList.remove('tab_block__right--hidden');
                                document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__dropdown .checkbox__field')[0].click();
                            }
                            // Инициализация кнопки добавления ID
                            initAddKeyword(newGroupDiscount.querySelector('.j-add-discount-id'));
                            // Инициализация кнопки удаления группы
                            initDeleteDiscountGroup(newGroupDiscount.querySelector('.j-delete-discount-group'));
                            deleteField = true;
                        } else if(document.querySelector('.popup--warning')) {
                            document.querySelector('.popup--warning .warning__title').innerText = 'Не указано название группы';
                            document.querySelector('.popup--warning').classList.add('popup--active');
                            popupShadow?.classList.add('wrapper_shadow--active');
                        }
                        break;
                    case 'commission_row':
                        word = field[i].value.trim();
                        if(word.length !== 0) {
                            let newGroupCommission = createGroupCommission(word);
                            // Добавление группы
                            field[i].closest('.tab_block__table').append(newGroupCommission);
                            // Инициализация кнопки добавления коммиссии
                            initAddRowInCommisssionGroup(newGroupCommission.querySelector('.j-add-commission-row-in-group'));
                            // Инициализация кнопки удаления группы
                            initDeleteCommissionGroupYM(newGroupCommission.querySelector('.j-delete-commission-group'));
                            deleteField = true;
                        } else if(document.querySelector('.popup--warning')) {
                            document.querySelector('.popup--warning .warning__title').innerText = 'Не указано имя группы';
                            document.querySelector('.popup--warning').classList.add('popup--active');
                            popupShadow?.classList.add('wrapper_shadow--active');
                        }
                        break;
                    case 'commission':
                        let commissionSection = field[i].closest('.group__field').querySelector('input[name="SECTION_ID"]').value.trim();
                        // Если не заполнено ID раздела, то не сохраняем
                        if(commissionSection.length !== 0) {
                            let idUniqueness = checkIdUniqueness(field[i].closest('.group__field').querySelector('.group__field--cell input'));
                            if(idUniqueness) {
                                field[i].closest('.group__field').querySelector('.group__field--cell').classList.remove('group__field--cell-warning');
                                let newRowCommission = createRowFromField(field[i]);
                                // Добавление новой строки
                                field[i].closest('.tab_block__table_body').append(newRowCommission);
                                // Инициализация кнопки удаления
                                initDeleteCommissionYM(newRowCommission.querySelector('.j-delete-commission-row'));
                                // Инициализация редактирования ячейки
                                initEditingCell(newRowCommission.querySelectorAll('.tab_block__table_cell--edit'));
                                deleteField = true;
                            } else if(document.querySelector('.popup--warning')) {
                                document.querySelector('.popup--warning .warning__title').innerText = 'Для раздела c таким ID уже указана комиссия';
                                document.querySelector('.popup--warning').classList.add('popup--active');
                                popupShadow?.classList.add('wrapper_shadow--active');
                                field[i].closest('.group__field').querySelector('.group__field--cell').classList.add('group__field--cell-warning');
                            }
                        } else if(document.querySelector('.popup--warning')) {
                            document.querySelector('.popup--warning .warning__title').innerText = 'Укажите ID раздела';
                            document.querySelector('.popup--warning').classList.add('popup--active');
                            popupShadow?.classList.add('wrapper_shadow--active');
                            field[i].closest('.group__field').querySelector('.group__field--cell').classList.add('group__field--cell-warning');
                        }
                        break;
                    case 'category':
                        let categoryName = field[i].closest('.group__field').querySelector('input[name="CATEGORY_NAME"]');
                        let categoryPrice = field[i].closest('.group__field').querySelector('input[name="CATEGORY_COMMISSION"]');
                        // Если не заполнено название категории или ставка, то не сохраняем
                        if(categoryName.value.trim().length !== 0 && categoryPrice.value.trim().length !== 0) {
                            let newRowCategory = createRowFromField(field[i]);
                            // Добавление новой строки
                            field[i].closest('.tab_block__table').querySelector('.tab_block__table_body').append(newRowCategory);
                            // Инициализация кнопки удаления
                            initDeleteCommissionCategory(newRowCategory.querySelector('.j-delete-commission-category'));
                            // Инициализация редактирования ячейки
                            initEditingCell(newRowCategory.querySelectorAll('.tab_block__table_cell--edit'));
                            deleteField = true;
                        } else {
                            if(document.querySelector('.popup--warning')) {
                                document.querySelector('.popup--warning .warning__title').innerText = 'Укажите категорию и ставку комиссии';
                                document.querySelector('.popup--warning').classList.add('popup--active');
                                popupShadow?.classList.add('wrapper_shadow--active');
                            }
                        }
                        break;
                    case 'matrix':
                        // Если нет ни одной заполенной ячейки, то не сохраняем
                        if(checkFieldEmptiness(field[i].closest('.group__field'))) {
                            let newRowInMatrix = createRowFromField(field[i]);
                            // Добавление новой строки
                            field[i].closest('.tab_block__right').querySelector('.tab_block__table_body').append(newRowInMatrix);
                            // Инициализация редактирования ячейки
                            initEditingCell(newRowInMatrix.querySelectorAll('.tab_block__table_cell--edit'));
                            // Задание ширины ячейкам таблицы
                            checkMatrixTable();
                            // Проверка необходимости отображения стрелок
                            checkArrowVisibilityMatrix();
                            deleteField = true;
                        }
                        break;
                }
                if(deleteField) {
                    // Удаление поля ввода
                    field[i].closest('.group__field').querySelector('.j-clear-field').click();
                }
            }
        });
    }
}

// Создание блока с ID
function createKeywordBlock(word) {
    const keywordBlock = document.createElement('div');
    keywordBlock.classList.add('group__keyword');
    keywordBlock.innerHTML = '<span class="keyword__text">' + word + '</span>' +
        '<div class="keyword__delete j-delete-keyword"></div>';
    return keywordBlock;
}

// Создание строки с поставщиком
function createSupplierBlock(word) {
    const supplierBlock = document.createElement('div');
    supplierBlock.classList.add('tab_block__table_row');
    supplierBlock.innerHTML = '<div class="tab_block__table_cell tab_block__table_cell--edit">' +
        '                                        <div class="cell_wrap">' +
        '                                            <div class="cell_wrap__left">' +
        '                                                <div class="cell_wrap__text">' + word + '</div>' +
        '                                            </div>' +
        '                                            <div class="cell_wrap__right">' +
        '                                                <div class="cell_wrap__action cell_wrap__action--delete j-delete-supplier"></div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>';
    return supplierBlock;
}

// Создание группы товаров по скидке
function createGroupDiscount(word) {
    const groupBlock = document.createElement('div');
    groupBlock.classList.add('tab_block__group');
    groupBlock.classList.add('tab_block__group--empty');
    groupBlock.innerHTML = '<div class="group__head">' +
        '<div class="group__head_left">' +
        '<p class="group__title">' + word + '</p>' +
        '<div class="cell_wrap__action cell_wrap__action--delete j-delete-discount-group"></div>' +
        '</div>' +
        '                                    <div class="tab_block__action j-add-discount-id">+ ID</div>' +
        '                                </div>' +
        '                                <div class="group__body">' +
        '                                    <div class="group__keywords"></div>' +
        '                                </div>';
    return groupBlock;
}

// Создание группы по комиссии
function createGroupCommission(word) {
    const commissionBlock = document.createElement('div');
    commissionBlock.classList.add('tab_block__table_body');
    commissionBlock.innerHTML = '<div class="tab_block__table_row tab_block__table_row--info">' +
        '                                        <div class="tab_block__table_cell">' +
        '                                            <div class="cell_wrap">' +
        '                                                <div class="cell_wrap__left">' +
        '                                                    <div class="cell_wrap__text">' + word +
        '                                                        <div class="cell_wrap__action cell_wrap__action--delete j-delete-commission-group"></div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                        <div class="tab_block__table_cell">' +
        '                                        </div>' +
        '                                        <div class="tab_block__table_cell">' +
        '                                            <div class="cell_wrap">' +
        '                                                <div class="cell_wrap__left">' +
        '                                                    <div class="cell_wrap__action j-add-commission-row-in-group">+ добавить</div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>';
    return commissionBlock;
}

// Создание строки из введенных данных
function createRowFromField(field, id) {
    const fieldRow = field.closest('.group__field');
    const fieldRowCell = fieldRow.querySelectorAll('.group__field--cell');
    let newRow = document.createElement('div');
    newRow.className = 'tab_block__table_row';
    for(let k=0; k<fieldRowCell?.length; k++) {
        const cellValue = fieldRowCell[k].querySelector('input').value.trim();
        let newCell = document.createElement('div');
        newCell.className = 'tab_block__table_cell tab_block__table_cell--edit';
        if(k === fieldRowCell.length-1) {
            newCell.innerHTML = '<div class="cell_wrap">' +
                '<div class="cell_wrap__left">' +
                '<div class="cell_wrap__text">' + cellValue + '</div>' +
                '</div>' +
                '<div class="cell_wrap__right">' +
                '<div class="cell_wrap__action cell_wrap__action--delete"></div>' +
                '</div>' +
                '</div>';
            if(fieldRowCell[k].querySelector('input').getAttribute('data-field') === 'commission') {
                newCell.querySelector('.cell_wrap__action').classList.add('j-delete-commission-row');
            } else if(fieldRowCell[k].querySelector('input').getAttribute('data-field') === 'category') {
                newCell.querySelector('.cell_wrap__action').classList.add('j-delete-commission-category');
            } else if(fieldRowCell[k].querySelector('input').getAttribute('data-field') === 'matrix') {
                newCell.querySelector('.cell_wrap__right').remove();
            }
        } else {
            newCell.innerHTML = '<div class="cell_wrap">' +
                '<div class="cell_wrap__left">' +
                '<div class="cell_wrap__text">' + cellValue + '</div>' +
                '</div>' +
                '</div>';
        }
        newRow.append(newCell);
    }
    return newRow;
}

// Прокрутка, если поле ввода не до конца видно
function scrollToNewField(field, scrollBlock) {
    if(field.getBoundingClientRect().bottom > document.documentElement.clientHeight) {
        scrollBlock.scrollBy(0, field.getBoundingClientRect().bottom - document.documentElement.clientHeight + 30);
    }
}

// Проверка наличия ID внутри группы
function checkKeywordLength(keywordGroup) {
    if(keywordGroup.querySelectorAll('.group__keyword').length > 0) {
        keywordGroup.classList.remove('tab_block__group--empty');
    } else {
        keywordGroup.classList.add('tab_block__group--empty');
    }
}


// Проверка наличия заполненных ячеек
function checkFieldEmptiness(fieldRow) {
    let readyToSave = false;
    const fieldsRowInput = fieldRow.querySelectorAll('input');
    for(let i=0; i<fieldsRowInput?.length; i++) {
        if(fieldsRowInput[i].value.trim().length > 0) {
            readyToSave = true;
        }
    }
    return readyToSave;
}

// Инициализация редактирования ячейки
function initEditingCell(cells) {
    for(let i=0; i<cells?.length; i++) {
        cells[i].addEventListener('click',()=>{
            if(!cells[i].classList.contains('tab_block__table_cell--is-editing')) {
                cells[i].classList.add('tab_block__table_cell--is-editing');
                const cellValue = cells[i].querySelector('.cell_wrap__text').innerText;
                let fieldInCell = document.createElement('input');
                fieldInCell.classList.add('cell_wrap__input');
                fieldInCell.value = cellValue;
                cells[i].querySelector('.cell_wrap').prepend(fieldInCell);
                fieldInCell.focus();
                // Инициализация сохранения значения ячейки
                initSavingFromField(fieldInCell);
            }
        });
    }
}
const editingCells = document.querySelectorAll('.page--data-regular .tab_block__table_cell--edit');
if(editingCells.length > 0) {
    initEditingCell(editingCells);
}

// Сохранение значения отредактированной ячейки
function initSavingFromField(field) {
    field.addEventListener('keyup',(e)=>{
        if (e.keyCode === 13) {
            e.preventDefault();
            if(document.querySelector('.tab--active').getAttribute('data-tab') === 'commissions') {
                if(field.closest('.tab_block__right')) {
                    // % комиссии по категориям
                    if(field.closest('.tab_block__table_cell') === field.closest('.tab_block__table_row').firstElementChild) {
                        // Изменения названия
                        let categoryName = field.value.trim();
                        if(categoryName === field.closest('.tab_block__table_cell').querySelector('.cell_wrap__text').innerText) {
                            // Если значение названия не изменили, то запрос не отправляется
                            returnCell(field);
                            return;
                        } else if(categoryName.length === 0) {
                            if(document.querySelector('.popup--warning')) {
                                document.querySelector('.popup--warning .warning__title').innerText = 'Укажите категорию';
                                document.querySelector('.popup--warning').classList.add('popup--active');
                                popupShadow?.classList.add('wrapper_shadow--active');
                            }
                            return;
                        }
                    }
                    if(field.closest('.tab_block__table_cell') === field.closest('.tab_block__table_row').lastElementChild) {
                        //Изменение ставки
                        let categoryPrice = field.value.trim();
                        if(categoryPrice.length === 0) {
                            if(document.querySelector('.popup--warning')) {
                                document.querySelector('.popup--warning .warning__title').innerText = 'Укажите ставку комиссии';
                                document.querySelector('.popup--warning').classList.add('popup--active');
                                popupShadow?.classList.add('wrapper_shadow--active');
                            }
                            return;
                        }
                    }
                    returnCell(field);
                } else if(field.closest('.tab_block__left')) {
                    // Комиссия на Яндекс Маркете ДБС
                    if(field.closest('.tab_block__table_cell') === field.closest('.tab_block__table_row').firstElementChild) {
                        // Изменения ID раздела
                        let commissionId = field.value.trim();
                        if(commissionId === field.closest('.tab_block__table_cell').querySelector('.cell_wrap__text').innerText) {
                            // Если ID раздела не изменили, то запрос не отправляется
                            returnCell(field);
                            return;
                        } else {
                            let idUniqueness = checkIdUniqueness(field);
                            if(!idUniqueness) {
                                // Если ID неуникально, то запрос не отправляется
                                if(document.querySelector('.popup--warning')) {
                                    document.querySelector('.popup--warning .warning__title').innerText = 'Для раздела c таким ID уже указана комиссия';
                                    document.querySelector('.popup--warning').classList.add('popup--active');
                                    popupShadow?.classList.add('wrapper_shadow--active');
                                }
                                field.closest('.tab_block__table_cell').classList.add('tab_block__table_cell--warning');
                                return;
                            } else {
                                field.closest('.tab_block__table_cell').classList.remove('tab_block__table_cell--warning');
                            }
                        }
                    }
                    returnCell(field);
                }
            } else if(document.querySelector('.tab--active').getAttribute('data-tab') === 'suppliers') {
                //Поставщики
                returnCell(field);
            } else if(document.querySelector('.tab--active').getAttribute('data-tab') === 'discounts') {
                if(field.closest('.tab_block__right')) {
                    // Матрица скидки на залежавшийся товар
                    returnCell(field);
                    // Задание ширины ячейкам таблицы Матрицы скидки
                    checkMatrixTable();
                    // Проверка необходимости отображения стрелок
                    checkArrowVisibilityMatrix();
                }
            }
        }
    });
}
function returnCell(field) {
    const newCellValue = field.value.trim();
    const cell = field.closest('.tab_block__table_cell');
    cell.querySelector('.cell_wrap__input').remove();
    cell.classList.remove('tab_block__table_cell--is-editing');
    cell.querySelector('.cell_wrap__text').innerText = newCellValue;
}


// Регулярные данные. Правило “Скидка на залежавшийся товар”. Удалить ID
const deleteKeyword = document.querySelectorAll('.j-delete-keyword');
for(let i=0; i<deleteKeyword?.length; i++) {
    initDeleteKeyword(deleteKeyword[i]);
}
function initDeleteKeyword(button) {
    button.addEventListener('click',()=>{
        const keywordGroup = button.closest('.tab_block__group');
        button.closest('.group__keyword').remove();
        // Проверка наличия ID в группе
        checkKeywordLength(keywordGroup);
    });
}


// Регулярные данные. Удалить поле для ввода новых данных
const clearField = document.querySelectorAll('.j-clear-field');
for(let i=0; i<clearField?.length; i++) {
    initClearField(clearField[i]);
}
function initClearField(button) {
    button.addEventListener('click',()=>{
        button.closest('.group__field').remove();
    });
}


// Регулярные данные. Матрица скидки на залежавшийся товар. Удалить строку
const deleteRowInMatrix = document.querySelectorAll('.j-delete-row-in-matrix');
for(let i=0; i<deleteRowInMatrix?.length; i++) {
    initDeleteRowInMatrix(deleteRowInMatrix[i]);
}
function initDeleteRowInMatrix(button) {
    button.addEventListener('click',()=>{
        button.closest('.tab_block__table_row').remove();
        // Задание ширины ячейкам таблицы
        checkMatrixTable();
        // Проверка необходимости отображения стрелок
        checkArrowVisibilityMatrix();
    });
}


// Регулярные данные. Матрица скидки на залежавшийся товар. Добавить строку
const addRowInMatrix = document.querySelectorAll('.j-add-discount-row');
for(let i=0; i<addRowInMatrix?.length; i++) {
    initAddRowInMatrix(addRowInMatrix[i]);
}
function initAddRowInMatrix(button) {
    button.addEventListener('click',()=>{
        const fieldForMatrix = document.createElement('div');
        fieldForMatrix.classList.add('group__field');
        fieldForMatrix.innerHTML = '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="Введите цену товара..." name="ITEM_PRICE" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM10" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM12" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM14" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM17" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM20" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM25" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM30" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM35" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM40" data-field="matrix"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="ITEM45" data-field="matrix"></label>' +
            '<div class="group__field_clear j-clear-field"></div>' +
            '</div>';
        // Добавление строки
        button.closest('.tab_block__right').querySelector('.tab_block__table').append(fieldForMatrix);
        fieldForMatrix.querySelector('input').focus();
        // Прокрутка, если поле ввода не до конца видно
        scrollToNewField(fieldForMatrix, fieldForMatrix.closest('.tab_block__right'));
        // Инициализация кнопки удаления поля ввода
        initClearField(fieldForMatrix.querySelector('.j-clear-field'));
        // Инициализация поля ввода
        addRowFromField(fieldForMatrix.querySelectorAll('input'));
        // Определение ширины ячеек в поле ввода
        checkFieldWidth();
    });
}


// Определение ширины ячеек в поле ввода
function checkFieldWidth() {
    const cellInField = document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table .group__field--cell');
    for(let i=1; i<cellInField?.length; i++) {
        const cellInHeader = document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table_group .tab_block__table_row:nth-child(2) .tab_block__table_cell')[i-1];
        cellInField[i].style.width = cellInHeader.offsetWidth +'px';
    }
}


// Регулярные данные. Комиссия. Добавить группу
const addRowInCommisssion = document.querySelectorAll('.j-add-commission-row');
for(let i=0; i<addRowInCommisssion?.length; i++) {
    initAddRowInCommisssion(addRowInCommisssion[i]);
}
function initAddRowInCommisssion(button) {
    button.addEventListener('click',()=>{
        const commissionPlaceholder = 'Введите комиссию...';
        const commissionName = 'COMMISSION_ROW';
        let commissionField = createField(commissionPlaceholder, commissionName);
        // Добавление строки комиссии
        button.closest('.tab_block__left').querySelector('.tab_block__table').append(commissionField);
        commissionField.querySelector('input').focus();
        // Прокрутка, если поле ввода не до конца видно
        scrollToNewField(commissionField, commissionField.closest('.tab_block__left'));
        // Инициализация кнопки удаления поля ввода
        initClearField(commissionField.querySelector('.j-clear-field'));
        // Инициализация поля ввода
        addRowFromField(commissionField.querySelectorAll('input'));
    });
}


// Регулярные данные. Комиссия. Добавить
const addRowInCommisssionGroup = document.querySelectorAll('.j-add-commission-row-in-group');
for(let i=0; i<addRowInCommisssionGroup?.length; i++) {
    initAddRowInCommisssionGroup(addRowInCommisssionGroup[i]);
}
function initAddRowInCommisssionGroup(button) {
    button.addEventListener('click',()=>{
        const fieldForCommision = document.createElement('div');
        fieldForCommision.classList.add('group__field');
        fieldForCommision.innerHTML = '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="Введите ID раздела..." name="SECTION_ID" data-field="commission"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="COMMISSION_MSK" data-field="commission"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="COMMISSION_SPB" data-field="commission"></label>' +
            '<div class="group__field_clear j-clear-field"></div>' +
            '</div>';
        // Добавление строки
        button.closest('.tab_block__table_body').append(fieldForCommision);
        fieldForCommision.querySelector('input').focus();
        // Прокрутка, если поле ввода не до конца видно
        scrollToNewField(fieldForCommision, fieldForCommision.closest('.tab_block__left'));
        // Инициализация кнопки удаления поля ввода
        initClearField(fieldForCommision.querySelector('.j-clear-field'));
        // Инициализация полей ввода
        addRowFromField(fieldForCommision.querySelectorAll('input'));
    });
}


// Регулярные данные. % комиссии по категориям. Добавить категорию
const addCommissionCategory = document.querySelectorAll('.j-add-commission-category');
for(let i=0; i<addCommissionCategory?.length; i++) {
    initAddCommissionCategory(addCommissionCategory[i]);
}
function initAddCommissionCategory(button) {
    button.addEventListener('click',()=>{
        const fieldForCategory = document.createElement('div');
        fieldForCategory.classList.add('group__field');
        fieldForCategory.innerHTML = '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="Введите категорию..." name="CATEGORY_NAME" data-field="category"></label>' +
            '</div>' +
            '<div class="group__field--cell">' +
            '<label><input type="text" placeholder="0" name="CATEGORY_COMMISSION" data-field="category"></label>' +
            '<div class="group__field_clear j-clear-field"></div>' +
            '</div>';
        // Добавление строки
        button.closest('.tab_block__right').querySelector('.tab_block__table').append(fieldForCategory);
        fieldForCategory.querySelector('input').focus();
        // Прокрутка, если поле ввода не до конца видно
        scrollToNewField(fieldForCategory, fieldForCategory.closest('.tab_block__right'));
        // Инициализация кнопки удаления поля ввода
        initClearField(fieldForCategory.querySelector('.j-clear-field'));
        // Инициализация полей ввода
        addRowFromField(fieldForCategory.querySelectorAll('input'));
    });
}


// Регулярные данные. Матрица скидки на залежавшийся товар. Задание единой ширины ячейкам в столбцах кроме первого
function checkWidthMatrixColumn() {
    const matrixColumnHeader = document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table_group .tab_block__table_row:nth-child(2) .tab_block__table_cell');
    if (matrixColumnHeader) {
        for (let i = 0; i < matrixColumnHeader.length; i++) {
            const matrixColumnBodyRow = document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table_body > .tab_block__table_row');
            // Сбрасываем минимальное значение ширины ячеек
            matrixColumnHeader[i].style.minWidth = '';
            matrixColumnHeader[i].style.width = '';
            for (let k = 0; k < matrixColumnBodyRow?.length; k++) {
                matrixColumnBodyRow[k].querySelectorAll('.tab_block__table_cell')[i + 1].style.minWidth = '';
                matrixColumnBodyRow[k].querySelectorAll('.tab_block__table_cell')[i + 1].style.width = '';
            }
            // Сбрасываем прокрутку таблицы
            //document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table').style.left = '';
            document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table_wrap').classList.remove('tab_block__table_wrap--not-full');
            // Определяем новое минимальное значение ширины ячеек
            let minWidthColumn = matrixColumnHeader[i].offsetWidth;
            for (let k = 0; k < matrixColumnBodyRow?.length; k++) {
                const matrixColumnBody = matrixColumnBodyRow[k].querySelectorAll('.tab_block__table_cell')[i + 1];
                minWidthColumn = matrixColumnBody.offsetWidth > minWidthColumn ? matrixColumnBody.offsetWidth : minWidthColumn;
            }
            matrixColumnHeader[i].style.minWidth = minWidthColumn + 'px';
            matrixColumnHeader[i].style.width = minWidthColumn + 'px';
            for (let k = 0; k < matrixColumnBodyRow?.length; k++) {
                matrixColumnBodyRow[k].querySelectorAll('.tab_block__table_cell')[i + 1].style.minWidth = minWidthColumn + 'px';
                matrixColumnBodyRow[k].querySelectorAll('.tab_block__table_cell')[i + 1].style.width = minWidthColumn + 'px';
            }
        }
    }
}


// Регулярные данные. Матрица скидки на залежавшийся товар. Определение необходимости отображения стрелок
function checkMatrixArrowVisibility() {
    const matrixTable = document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table');
    if(matrixTable) {
        matrixTable.style.width = '';
        if(matrixTable.offsetWidth > matrixTable.parentElement.offsetWidth) {
            matrixTable.parentElement.classList.add('tab_block__table_wrap--hidden');
        } else {
            matrixTable.parentElement.classList.remove('tab_block__table_wrap--hidden');
            matrixTable.parentElement.classList.add('tab_block__table_wrap--not-full');
        }
    }
}


// Регулярные данные. Матрица скидки на залежавшийся товар. Стилизация таблицы
function checkMatrixTable() {
    document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table_wrap').style.opacity = '0';
    checkWidthMatrixColumn();
    checkMatrixArrowVisibility();
    initTableMatrixDrag();
    document.querySelector('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table_wrap').style.opacity = '1';
}
window.addEventListener('resize',()=>{
    if(document.querySelectorAll('.tab_block[data-tab-block="discounts"] .tab_block__right .tab_block__table').length > 0) {
        checkMatrixTable();
    }
});


// Проверка ID на уникальность
function checkIdUniqueness(field) {
    const idFromField = field.value.trim();
    let isUnique = true;
    if(idFromField.length === 0) {
        return isUnique;
    }
    const idFromTable = field.closest('.tab_block__table').querySelectorAll('.tab_block__table_body .tab_block__table_cell:first-child .cell_wrap__text');
    for(let i=0; i<idFromTable?.length; i++) {
        if(field.closest('.tab_block__table_cell') && field.closest('.tab_block__table_cell').querySelector('.cell_wrap__text') === idFromTable[i]) continue;
        if(idFromField === idFromTable[i].innerText.trim()) {
            isUnique = false;
        }
    }
    return isUnique;
}


// Проверка ID на уникальность в группах товаров по скидке
function checkIdUniquenessDiscount(field) {
    const idFromField = field.value.trim();
    let isUnique = true;
    const idFromGroups = field.closest('.tab_block__left').querySelectorAll('.group__keyword .keyword__text');
    for(let i=0; i<idFromGroups?.length; i++) {
        if(idFromField === idFromGroups[i].innerText.trim()) {
            isUnique = false;
        }
    }
    return isUnique;
}