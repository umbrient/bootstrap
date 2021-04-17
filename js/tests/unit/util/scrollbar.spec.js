import { clearBodyAndDocument, clearFixture, getFixture } from '../../helpers/fixture'
import Manipulator from '../../../src/dom/manipulator'
import ScrollBarHelper from '../../../src/util/scrollbar'

describe('ScrollBar', () => {
  let fixtureEl
  const doc = document.documentElement
  const parseInt = arg => Number.parseInt(arg, 10)
  const getRightPadding = el => parseInt(window.getComputedStyle(el).paddingRight)
  const getOverFlow = el => el.style.overflow
  const getPaddingAttr = el => Manipulator.getDataAttribute(el, 'padding-right')
  const getOverFlowAttr = el => Manipulator.getDataAttribute(el, 'overflow')
  const windowCalculations = () => {
    return {
      htmlClient: document.documentElement.clientWidth,
      htmlOffset: document.documentElement.offsetWidth,
      docClient: document.body.clientWidth,
      htmlBound: document.documentElement.getBoundingClientRect().width,
      bodyBound: document.body.getBoundingClientRect().width,
      window: window.innerWidth,
      width: Math.abs(window.innerWidth - document.documentElement.clientWidth)
    }
  }

  const isScrollBarHidden = () => { // IOS devices, Android devices and Browsers on Mac, hide scrollbar by default and appear it, only while scrolling. So the tests for scrollbar would fail
    const calc = windowCalculations()
    return calc.htmlClient === calc.htmlOffset && calc.htmlClient === calc.window
  }

  beforeAll(() => {
    fixtureEl = getFixture()
    // custom fixture to avoid extreme style values
    fixtureEl.removeAttribute('style')
  })

  afterAll(() => {
    fixtureEl.remove()
  })

  afterEach(() => {
    clearFixture()
    clearBodyAndDocument()
  })

  beforeEach(() => {
    clearBodyAndDocument()
  })

  describe('isBodyOverflowing', () => {
    it('should return true if body is overflowing', () => {
      doc.style.overflowY = 'scroll'
      document.body.style.overflowY = 'scroll'
      fixtureEl.innerHTML = [
        '<div style="height: 110vh; width: 100%"></div>'
      ].join('')
      const result = new ScrollBarHelper().isOverflowing()

      if (isScrollBarHidden()) {
        expect(result).toEqual(false)
      } else {
        expect(result).toEqual(true)
      }
    })

    it('should return false if body is overflowing', () => {
      doc.style.overflowY = 'hidden'
      document.body.style.overflowY = 'hidden'
      fixtureEl.innerHTML = [
        '<div style="height: 110vh; width: 100%"></div>'
      ].join('')
      const result = new ScrollBarHelper().isOverflowing()

      expect(result).toEqual(false)
    })
  })

  describe('getWidth', () => {
    it('should return an integer greater than zero, if body is overflowing', () => {
      doc.style.overflowY = 'scroll'
      document.body.style.overflowY = 'scroll'
      fixtureEl.innerHTML = [
        '<div style="height: 110vh; width: 100%"></div>'
      ].join('')
      const result = new ScrollBarHelper().getWidth()

      if (isScrollBarHidden()) {
        expect(result).toBe(0)
      } else {
        expect(result).toBeGreaterThan(1)
      }
    })

    it('should return 0 if body is not overflowing', () => {
      doc.style.overflowY = 'hidden'
      document.body.style.overflowY = 'hidden'
      fixtureEl.innerHTML = [
        '<div style="height: 110vh; width: 100%"></div>'
      ].join('')

      const result = new ScrollBarHelper().getWidth()

      expect(result).toEqual(0)
    })
  })

  describe('hide - reset', () => {
    it('should adjust the inline padding of fixed elements which are full-width', done => {
      fixtureEl.innerHTML = [
        '<div style="height: 110vh; width: 100%">' +
        '<div class="fixed-top" id="fixed1" style="padding-right: 0px; width: 100vw"></div>',
        '<div class="fixed-top" id="fixed2" style="padding-right: 5px; width: 100vw"></div>',
        '</div>'
      ].join('')
      document.documentElement.style.overflowY = 'scroll'

      const docOriginalOverflow = 'scroll'
      doc.style.overflowY = docOriginalOverflow

      const getRightPadding = el => Number.parseInt(window.getComputedStyle(el).paddingRight, 10)
      const getRightPaddingAttr = el => el.getAttribute('data-bs-padding-right')
      const fixedEl = fixtureEl.querySelector('#fixed1')
      const fixedEl2 = fixtureEl.querySelector('#fixed2')
      const originalPadding = getRightPadding(fixedEl)
      const originalPadding2 = getRightPadding(fixedEl2)
      const expectedPadding = originalPadding + new ScrollBarHelper().getWidth()
      const expectedPadding2 = originalPadding2 + new ScrollBarHelper().getWidth()

      new ScrollBarHelper().hide()

      let currentPadding = getRightPadding(fixedEl)
      let currentPadding2 = getRightPadding(fixedEl2)
      expect(getRightPaddingAttr(fixedEl)).toEqual(`${originalPadding}px`, 'original fixed element padding should be stored in data-bs-padding-right')
      expect(getRightPaddingAttr(fixedEl2)).toEqual(`${originalPadding2}px`, 'original fixed element padding should be stored in data-bs-padding-right')
      expect(currentPadding).toEqual(expectedPadding, 'fixed element padding should be adjusted while opening')
      expect(currentPadding2).toEqual(expectedPadding2, 'fixed element padding should be adjusted while opening')
      expect(doc.style.overflowY).toBe('hidden')

      new ScrollBarHelper().reset()
      currentPadding = getRightPadding(fixedEl)
      currentPadding2 = getRightPadding(fixedEl2)
      expect(getRightPaddingAttr(fixedEl)).toEqual(null, 'data-bs-padding-right should be cleared after closing')
      expect(getRightPaddingAttr(fixedEl2)).toEqual(null, 'data-bs-padding-right should be cleared after closing')
      expect(currentPadding).toEqual(originalPadding, 'fixed element padding should be reset after closing')
      expect(currentPadding2).toEqual(originalPadding2, 'fixed element padding should be reset after closing')
      expect(doc.style.overflowY).toBe(docOriginalOverflow)
      done()
    })

    it('should adjust the inline margin of sticky elements', done => {
      fixtureEl.innerHTML = [
        '<div style="height: 110vh">' +
        '<div class="sticky-top" style="margin-right: 10px; padding-right: 20px; width: 100vw; height: 10px"></div>',
        '</div>'
      ].join('')
      doc.style.overflowY = 'scroll'

      const stickyTopEl = fixtureEl.querySelector('.sticky-top')
      const getRightPadding = () => Number.parseInt(window.getComputedStyle(stickyTopEl).paddingRight, 10)
      const getRightMargin = () => Number.parseInt(window.getComputedStyle(stickyTopEl).marginRight, 10)
      const getRightPaddingAttr = () => stickyTopEl.getAttribute('data-bs-padding-right')
      const getRightMarginAttr = () => stickyTopEl.getAttribute('data-bs-margin-right')
      const originalMargin = getRightMargin()
      const originalPadding = getRightPadding()
      const expectedMargin = originalMargin - new ScrollBarHelper().getWidth()
      const expectedPadding = originalPadding + new ScrollBarHelper().getWidth()
      new ScrollBarHelper().hide()

      expect(getRightMarginAttr()).toEqual(`${originalMargin}px`, 'original sticky element margin should be stored in data-bs-margin-right')
      expect(getRightMargin()).toEqual(expectedMargin, 'sticky element margin should be adjusted while opening')
      expect(getRightPaddingAttr()).toEqual(`${originalPadding}px`, 'original sticky element margin should be stored in data-bs-margin-right')
      expect(getRightPadding()).toEqual(expectedPadding, 'sticky element margin should be adjusted while opening')

      new ScrollBarHelper().reset()
      expect(getRightMarginAttr()).toEqual(null, 'data-bs-margin-right should be cleared after closing')
      expect(getRightMargin()).toEqual(originalMargin, 'sticky element margin should be reset after closing')
      expect(getRightPaddingAttr()).toEqual(null, 'data-bs-margin-right should be cleared after closing')
      expect(getRightPadding()).toEqual(originalPadding, 'sticky element margin should be reset after closing')
      done()
    })

    it('should not adjust the inline margin and padding of sticky and fixed elements when element do not have full width', () => {
      fixtureEl.innerHTML = [
        '<div class="sticky-top" style="margin-right: 0px; padding-right: 0px; width: 50vw"></div>'
      ].join('')

      const getRightPadding = () => Number.parseInt(window.getComputedStyle(stickyTopEl).paddingRight, 10)
      const getRightMargin = () => Number.parseInt(window.getComputedStyle(stickyTopEl).marginRight, 10)
      const stickyTopEl = fixtureEl.querySelector('.sticky-top')
      const originalMargin = getRightMargin()
      const originalPadding = getRightPadding()

      new ScrollBarHelper().hide()

      const currentMargin = getRightMargin()
      const currentPadding = getRightPadding()

      expect(currentMargin).toEqual(originalMargin, 'sticky element\'s margin should not be adjusted while opening')
      expect(currentPadding).toEqual(originalPadding, 'sticky element\'s padding should not be adjusted while opening')

      new ScrollBarHelper().reset()
    })

    it('should not put data-attribute if element doesn\'t have the proper style property, should just remove style property if element didn\'t had one', done => {
      fixtureEl.innerHTML = [
        '<div style="height: 110vh; width: 100%">' +
        '<div class="fixed-top" id="fixed" style="width: 100vw"></div>',
        '<div class="sticky-top" id="sticky" style="width: 100vw"></div>',
        '</div>'
      ].join('')

      document.body.style.overflowY = 'scroll'

      const hasRightPaddingAttr = el => el.hasAttribute('data-bs-padding-right')
      const hasRightMarginAttr = el => el.hasAttribute('data-bs-margin-right')
      const fixedEl = fixtureEl.querySelector('#fixed')
      const stickyEl = fixtureEl.querySelector('#sticky')
      const scrollBarWidth = Scrollbar.getWidth()

      new ScrollBarHelper().hide()

        const currentPadding = getRightPadding(el)

        expect(currentPadding).toEqual(scrollBarWidth + originalPadding)
        expect(currentPadding).toEqual(scrollBarWidth + parseInt(styleSheetPadding))
        expect(getPaddingAttr(el)).toBeNull() // We do not have to keep css padding
        expect(getOverFlow(el)).toEqual('hidden')
        expect(getOverFlowAttr(el)).toEqual(originalOverFlow)

      new ScrollBarHelper().reset()

        const currentPadding1 = getRightPadding(el)
        expect(currentPadding1).toEqual(originalPadding)
        expect(getPaddingAttr(el)).toEqual(null)
        expect(getOverFlow(el)).toEqual(originalOverFlow)
        expect(getOverFlowAttr(el)).toEqual(null)
      })
    })
    it('should ignore values set via CSS when trying to restore body padding after closing', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'
      const styleTest = document.createElement('style')

      styleTest.type = 'text/css'
      styleTest.appendChild(document.createTextNode('body { padding-right: 7px; }'))
      document.head.appendChild(styleTest)

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.bs.modal', () => {
        modal.toggle()
      })

      modalEl.addEventListener('hidden.bs.modal', () => {
        expect(window.getComputedStyle(document.body).paddingLeft).toEqual('0px', 'body does not have inline padding set')
        document.head.removeChild(styleTest)
        done()
      })

      modal.toggle()
    })

    it('should not adjust the inline body padding when it does not overflow', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const originalPadding = window.getComputedStyle(document.body).paddingRight

      // Hide scrollbars to prevent the body overflowing
      const doc = document.documentElement
      doc.style.overflowY = 'hidden'
      doc.style.paddingRight = '0px'

      modalEl.addEventListener('shown.bs.modal', () => {
        const currentPadding = window.getComputedStyle(document.body).paddingRight

        expect(currentPadding).toEqual(originalPadding, 'body padding should not be adjusted')
        done()
      })

      modal.show()
    })

    it('should not adjust the inline body padding when it does not overflow, even on a scaled display', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const originalPadding = window.getComputedStyle(document.body).paddingRight
      const doc = document.documentElement
      // Remove body margins as would be done by Bootstrap css
      document.body.style.margin = '0'

      // Hide scrollbars to prevent the body overflowing
      doc.style.overflowY = 'hidden'

      // Simulate a discrepancy between exact, i.e. floating point body width, and rounded body width
      // as it can occur when zooming or scaling the display to something else than 100%
      doc.style.paddingRight = '.48px'

      modalEl.addEventListener('shown.bs.modal', () => {
        const currentPadding = window.getComputedStyle(document.body).paddingRight

        expect(currentPadding).toEqual(originalPadding, 'body padding should not be adjusted')
        done()
      })

      modal.show()
    })
  describe('Body Handling', () => {
    it('should hide scrollbar and reset it to its initial value', () => {
      const styleSheetPadding = '7px'
      fixtureEl.innerHTML = [
        '<style>',
        '  body {',
        `       padding-right: ${styleSheetPadding} }`,
        '  }',
        '</style>'
      ].join('')

      const el = document.body
      const inlineStylePadding = '10px'
      el.style.paddingRight = inlineStylePadding

      const originalPadding = getRightPadding(el)
      expect(originalPadding).toEqual(parseInt(inlineStylePadding)) // Respect only the inline style as it has prevails this of css
      const originalOverFlow = 'auto'
      el.style.overflow = originalOverFlow
      const scrollBarWidth = Scrollbar.getWidth()

      Scrollbar.hide()

      const currentPadding = getRightPadding(el)

      expect(currentPadding).toEqual(scrollBarWidth + originalPadding)
      expect(currentPadding).toEqual(scrollBarWidth + parseInt(inlineStylePadding))
      expect(getPaddingAttr(el)).toEqual(inlineStylePadding)
      expect(getOverFlow(el)).toEqual('hidden')
      expect(getOverFlowAttr(el)).toEqual(originalOverFlow)

      Scrollbar.reset()

      const currentPadding1 = getRightPadding(el)
      expect(currentPadding1).toEqual(originalPadding)
      expect(getPaddingAttr(el)).toEqual(null)
      expect(getOverFlow(el)).toEqual(originalOverFlow)
      expect(getOverFlowAttr(el)).toEqual(null)
    })

    it('should hide scrollbar and reset it to its initial value - respecting css rules', () => {
      const styleSheetPadding = '7px'
      fixtureEl.innerHTML = [
        '<style>',
        '  body {',
        `       padding-right: ${styleSheetPadding} }`,
        '  }',
        '</style>'
      ].join('')
      const el = document.body
      const originalPadding = getRightPadding(el)
      const originalOverFlow = 'scroll'
      el.style.overflow = originalOverFlow
      const scrollBarWidth = Scrollbar.getWidth()

      Scrollbar.hide()

      const currentPadding = getRightPadding(el)

      expect(currentPadding).toEqual(scrollBarWidth + originalPadding)
      expect(currentPadding).toEqual(scrollBarWidth + parseInt(styleSheetPadding))
      expect(getPaddingAttr(el)).toBeNull() // We do not have to keep css padding
      expect(getOverFlow(el)).toEqual('hidden')
      expect(getOverFlowAttr(el)).toEqual(originalOverFlow)

      Scrollbar.reset()

      const currentPadding1 = getRightPadding(el)
      expect(currentPadding1).toEqual(originalPadding)
      expect(getPaddingAttr(el)).toEqual(null)
      expect(getOverFlow(el)).toEqual(originalOverFlow)
      expect(getOverFlowAttr(el)).toEqual(null)
    })
  })
  })
})
