if (!window['$']) {
    window['$'] = (selector) => document.querySelector(selector)
}


document.addEventListener('DOMContentLoaded', () =>
{
    main_setupDiceForm()
})



////////////////////////////////////////////////////////////////////////////////
function main_setupDiceForm()
{
    const form = $('.form-dice-roll')
    const btnDiceAdd = $('.btn-dice-add')
    const btnDiceRemove = $('.btn-dice-remove')
    const countDisplayBlock = $('.dice-count-display')

    form.addEventListener('submit', event => {
        event.preventDefault()
        return false
    })

    const diceSystem = new DiceSystem(1, 3)

    setupStartingDiceIcons(diceSystem, countDisplayBlock, btnDiceRemove)

    btnDiceAdd.addEventListener('click',
        makeBtnDiceAddHandler(diceSystem, countDisplayBlock, btnDiceRemove))

    btnDiceRemove.addEventListener('click',
        makeBtnDiceRemoveHandler(diceSystem, countDisplayBlock, btnDiceAdd))

    countDisplayBlock.addEventListener('click', () => {
        console.log(diceSystem.roll())
    })
}



////////////////////////////////////////////////////////////////////////////////
class DiceSystem
{
    diceCount
    maxDiceCount

    constructor(diceCount=1, maxDiceCount=2) {
        if (diceCount < 0 || maxDiceCount < 1) {
            throw new Error('invalid DiceRoll constructor parameter values')
        }
        this.diceCount = Math.min(diceCount, maxDiceCount)
        this.maxDiceCount = maxDiceCount
    }

    addDice() {
        this.diceCount = Math.min(this.diceCount+1, this.maxDiceCount)
        return this.diceCount
    }

    removeDice() {
        this.diceCount = Math.max(this.diceCount-1, 1)
        return this.diceCount
    }

    count() {
        return this.diceCount
    }

    icon() {
        return '🎲'
    }

    roll() {
        const rolls = []
        for (let i=0; i<this.diceCount; ++i) {
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



function setupStartingDiceIcons(diceSystem, countDisplayBlock, btnDiceRemove)
{
    for (let i=0; i<diceSystem.count(); ++i) {
        addDiceIcon(countDisplayBlock)
    }
    if (diceSystem.count() === 1) {
        btnDiceRemove.disabled = true
    }
}



function makeBtnDiceAddHandler(diceSystem, countDisplayBlock, btnDiceRemove)
{
    return function() {
        if (diceSystem.count() < diceSystem.addDice()) {
            if (diceSystem.count() === diceSystem.maxDiceCount) {
                this.disabled = true
            }
            btnDiceRemove.disabled = false
            addDiceIcon(countDisplayBlock)
        }
    }
}



function makeBtnDiceRemoveHandler(diceSystem, countDisplayBlock, btnDiceAdd)
{
    return function() {
        if (diceSystem.count() > diceSystem.removeDice()) {
            if (diceSystem.count() === 1) {
                this.disabled = true
            }
            btnDiceAdd.disabled = false
            countDisplayBlock.removeChild(countDisplayBlock.firstChild)
        }
    }
}
