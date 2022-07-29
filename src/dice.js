document.addEventListener('DOMContentLoaded', () =>
{
    main_setupDiceForm(20)
})



////////////////////////////////////////////////////////////////////////////////
function main_setupDiceForm(diceCountMax = 2)
{
    const form = $('.form-dice-roll')
    const btnDiceAdd = $('.btn-dice-add')
    const btnDiceRemove = $('.btn-dice-remove')
    const diceIconsBlock = $('.dice-icons-block')
    const resultsIconsGroup = $('.dice-results-icons-grp')

    form.addEventListener('submit', event => {
        event.preventDefault()
        return false
    })

    const diceSystem = new DiceSystem(1, diceCountMax)
    const resultIcons = [ '⚀', '⚁', '⚂', '⚃', '⚄', '⚅' ]

    setupStartingDiceIcons(diceSystem, diceIconsBlock, btnDiceRemove)

    btnDiceAdd.addEventListener('click',
        makeBtnDiceAddHandler(diceSystem, diceIconsBlock, btnDiceRemove))

    btnDiceRemove.addEventListener('click',
        makeBtnDiceRemoveHandler(diceSystem, diceIconsBlock, btnDiceAdd))

    diceIconsBlock.addEventListener('click', () => {
        if (!diceIconsBlock.classList.contains('is-active')) {
            const results = diceSystem.roll()
            animateDiceRoll(diceIconsBlock)
            displayRollsResults(results, resultIcons, resultsIconsGroup)
        }
    })
}



////////////////////////////////////////////////////////////////////////////////
class DiceSystem
{
    _diceCount
    _maxDiceCount

    constructor(diceCount=1, maxDiceCount=2) {
        if (diceCount < 0 || maxDiceCount < 1) {
            throw new Error('invalid DiceRoll constructor parameter values')
        }
        this._diceCount = Math.min(diceCount, maxDiceCount)
        this._maxDiceCount = maxDiceCount
    }

    addDice() {
        this._diceCount = Math.min(this._diceCount+1, this._maxDiceCount)
        return this._diceCount
    }

    removeDice() {
        this._diceCount = Math.max(this._diceCount-1, 1)
        return this._diceCount
    }

    count() {
        return this._diceCount
    }

    maxDiceCount() {
        return this._maxDiceCount
    }

    roll() {
        const rolls = []
        for (let i=0; i<this._diceCount; ++i) {
            rolls.push(Math.ceil(Math.random() * 6))
        }
        return rolls
    }
}



////////////////////////////////////////////////////////////////////////////////
function addDiceIcon(targetNode)
{
    const icon = document.createElement('div')
    icon.className = 'icon-dice'
    icon.innerHTML = '🎲'
    targetNode.appendChild(icon)
}



function setupStartingDiceIcons(diceSystem, diceIconsBlock, btnDiceRemove)
{
    for (let i=0; i<diceSystem.count(); ++i) {
        addDiceIcon(diceIconsBlock)
    }
    if (diceSystem.count() === 1) {
        btnDiceRemove.disabled = true
    }
}



function makeBtnDiceAddHandler(diceSystem, diceIconsBlock, btnDiceRemove)
{
    return function() {
        if (diceSystem.count() < diceSystem.addDice()) {
            if (diceSystem.count() === diceSystem.maxDiceCount()) {
                this.disabled = true
            }
            btnDiceRemove.disabled = false
            addDiceIcon(diceIconsBlock)
        }
    }
}



function makeBtnDiceRemoveHandler(diceSystem, diceIconsBlock, btnDiceAdd)
{
    return function() {
        if (diceSystem.count() > diceSystem.removeDice()) {
            if (diceSystem.count() === 1) {
                this.disabled = true
            }
            btnDiceAdd.disabled = false
            diceIconsBlock.removeChild(diceIconsBlock.firstChild)
        }
    }
}



function animateDiceRoll(diceIconsBlock)
{
    diceIconsBlock.classList.add('animation-dice-roll', 'is-active')
    setTimeout(
        ()=>diceIconsBlock.classList.remove('animation-dice-roll', 'is-active'),
        1500)
}



function displayRollsResults(results, resultIcons, resultsIconsGroup)
{
    resultsIconsGroup.innerHTML = ''

    const resultIconNodeTemplate = document.createElement('div')
    resultIconNodeTemplate.classList.add('dice-result-icon')

    results.forEach(resultValue => {
        const resultIconNode = resultIconNodeTemplate.cloneNode()
        resultIconNode.innerHTML = resultIcons[resultValue-1]
        resultsIconsGroup.appendChild(resultIconNode)
    })

    resultsIconsGroup.animate([{opacity: 1}, {opacity: 0}], {
        duration: 0, delay: 0, fill: 'forwards'
    })
    resultsIconsGroup.animate([{opacity: 0}, {opacity: 1}], {
        duration: 900, delay: 1100, fill: 'forwards'
    })
}
