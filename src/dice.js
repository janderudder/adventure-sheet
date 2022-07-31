document.addEventListener('DOMContentLoaded', () =>
{
    main_setupDiceForm(20)
})



////////////////////////////////////////////////////////////////////////////////
function main_setupDiceForm(diceCountMax = 2)
{
    const form                  = $('.form-dice-roll')
    const btnDiceAdd            = $('.btn-dice-add')
    const btnDiceRemove         = $('.btn-dice-remove')
    const diceIconsBlock        = $('.grp-dice-icons-block')
    const resultsBlock          = $('.grp-dice-results-block')
    const resultsIconsGroup     = $('.grp-dice-results-icons')
    const resultsTotalValueNode = $('.dice-results-total-value')
    const helpTotalReveal       = $('.grp-dice-results-block .help')

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

    diceIconsBlock.addEventListener('click', function doRoll() {
        if (!diceIconsBlock.classList.contains('is-active'))
        {
            // notify the system that the dice icons are rolling
            diceIconsBlock.classList.add('is-active')

            // make result icons non-clickable (although they will be made
            // invisible a few lines below)
            resultsIconsGroup.classList.remove('is-active')

            animateDiceRoll(diceIconsBlock, function doAfterAnimation() {
                diceIconsBlock.classList.remove('is-active')
                resultsIconsGroup.classList.add('is-active') // make clickable
            })

            const results = diceSystem.roll()
            displayResultIcons(results, resultIcons, resultsIconsGroup)

            // hide total score value
            resultsTotalValueNode.style.opacity = '0'
            writeTotalScore(computeDiceTotal(results), resultsTotalValueNode)

            animateResultsBlock(resultsBlock)
        }
    })

    // show total value when the result icons are clicked
    resultsIconsGroup.addEventListener('click', function makeTotalVisible() {
        // while not in the process of rolling the dice
        if (!diceIconsBlock.classList.contains('is-active')) {
            // make the dice icons not clickable anymore
            resultsIconsGroup.classList.remove('is-active')
            resultsTotalValueNode.style.opacity = '1'
        }
    })

    setHelpMessageHidingEventHandlers(
        helpTotalReveal, diceIconsBlock, resultsIconsGroup)
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
    icon.addEventListener('transitionstart', () => {
        icon.classList.add('is-animated')
    })
    icon.addEventListener('transitionend', () => {
        icon.classList.remove('is-animated')
    })
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
        const btnDiceAdd = this
        if (diceSystem.count() < diceSystem.addDice()) {
            if (diceSystem.count() === diceSystem.maxDiceCount()) {
                btnDiceAdd.disabled = true
            }
            btnDiceRemove.disabled = false
            addDiceIcon(diceIconsBlock)
        }
    }
}



function makeBtnDiceRemoveHandler(diceSystem, diceIconsBlock, btnDiceAdd)
{
    return function() {
        const btnDiceRemove = this
        const lastDiceIcon  = diceIconsBlock.lastChild
        if (!lastDiceIcon.classList.contains('is-animated'))
        {
            if (diceSystem.count() > diceSystem.removeDice()) {
                btnDiceAdd.disabled = false
                diceIconsBlock.removeChild(lastDiceIcon)
                if (diceSystem.count() === 1) {
                    btnDiceRemove.disabled = true
                }
            }
        }
    }
}



function animateDiceRoll(diceIconsBlock, afterAnimationCallback =()=>{})
{
    diceIconsBlock.classList.add('animation-dice-roll')
    setTimeout(() => {
        diceIconsBlock.classList.remove('animation-dice-roll')
        afterAnimationCallback()
    }, 1500)
}



function displayResultIcons(results, resultIcons, resultsIconsGroup)
{
    resultsIconsGroup.innerHTML = ''

    const resultIconNodeTemplate = document.createElement('div')
    resultIconNodeTemplate.classList.add('dice-result-icon')

    results.forEach(resultValue => {
        const resultIconNode = resultIconNodeTemplate.cloneNode()
        resultIconNode.innerHTML = resultIcons[resultValue-1]
        resultsIconsGroup.appendChild(resultIconNode)
    })
}



function animateResultsBlock(resultsBlock)
{
    resultsBlock.animate([{opacity: 1}, {opacity: 0}], {
        duration: 0, delay: 0, fill: 'forwards'
    })
    resultsBlock.animate([{opacity: 0}, {opacity: 1}], {
        duration: 900, delay: 1100, fill: 'forwards'
    })
}



function computeDiceTotal(results)
{
    return results.reduce((total, rollValue) => total += rollValue, 0)
}



function writeTotalScore(totalValue, resultsTotalValueNode)
{
    resultsTotalValueNode.innerHTML = totalValue
}



function setHelpMessageHidingEventHandlers(
    helpTotalReveal, diceIconsBlock, resultsIconsGroup)
{
    // Signal for manual and automatic hiding of the help message
    const helpMessageHideController = new AbortController()

    // hide after two rolls (auto)
    let rollCount = 0
    diceIconsBlock.addEventListener('click', function handleHelpHiding() {
        if (++rollCount>2) {
            helpTotalReveal.classList.add('is-removed')
            helpMessageHideController.abort()
        }
    }, {signal: helpMessageHideController.signal})

    // or after one tap on results / total reveal (manual)
    resultsIconsGroup.addEventListener('click', function hideHelp() {
        helpTotalReveal.classList.add('is-removed')
    }, {once:true, signal:helpMessageHideController.signal})
}
