/**
 * The shared demo of the product's panel, mounted by both landing pages.
 *
 * Fills every `[data-coreness-demo]` mount with the rail, the MCP roster, the General team card, the Qoder
 * models and the rate limiter. A classic script — no module, no dependency, no request, so the pages open
 * from `file://`. The state lives in the DOM: a switch carries `aria-checked`, a field carries its value,
 * so what the picture shows and what the tree says cannot drift apart.
 */
(function () {
  'use strict'

  /* The roster of the product's own sample server: three roles, two tools each — sample content, not product
     features. A server that stands off is not connected, so its tools are neither listed nor counted. */
  const SERVERS = [
    { name: 'notes', command: 'node mcp-demo.mjs notes', tools: ['write_note', 'read_note'], on: true },
    { name: 'files', command: 'node mcp-demo.mjs files', tools: ['read_file', 'list_files'], on: true },
    { name: 'search', command: 'node mcp-demo.mjs search', tools: ['search_notes', 'find_file'], on: false },
  ]

  const SECTIONS = [
    ['general', 'General'],
    ['mcp', 'MCP'],
    ['qoder', 'Qoder'],
    ['rate', 'Rate limiter'],
  ]

  /* Sample model families for the Qoder route, each with the reasoning effort it names: the families hold
     across releases, where version numbers would not. Sample content, like the server roster above. */
  const MODELS = [
    ['Auto', 'picks a family for the call'],
    ['DeepSeek', 'reasoning effort max'],
    ['Qwen', 'reasoning effort xhigh'],
    ['GLM', 'reasoning effort high'],
    ['Kimi', 'reasoning effort high'],
  ]

  /** The count line the product draws over the roster: the total, then only the states that occur, and the
      tools of the servers that are connected. */
  const countText = (servers) => {
    const on = servers.filter((server) => server.on).length
    const tools = servers.reduce((sum, server) => sum + (server.on ? server.tools.length : 0), 0)
    const parts = [`${servers.length} total`]
    if (on > 0) parts.push(`${on} on`)
    if (servers.length - on > 0) parts.push(`${servers.length - on} off`)
    if (tools > 0) parts.push(`${tools} with tools`)
    return parts.join(' · ')
  }

  /** A server's tools line: its names while it is connected, the product's own word while it is not. */
  const toolsMarkup = (server) => server.on && server.tools.length > 0
    ? `<span class="coreness-card-tools-label">Tools (${server.tools.length}):</span> ${server.tools.join(', ')}`
    : 'no tools yet'

  const railMarkup = () => SECTIONS.map(([id, label]) =>
    `<button type="button" class="coreness-rail-item" data-demo-tab="${id}"${id === 'mcp' ? ' aria-current="true"' : ''}>${label}</button>`
  ).join('')

  const cardMarkup = (server) => `
        <li class="coreness-panel coreness-card" data-demo-server="${server.name}">
          <div class="coreness-card-main">
            <span class="coreness-card-name">${server.name}</span>
            <span class="coreness-card-sub">Standard input/output · <code>${server.command}</code></span>
          </div>
          <button type="button" class="coreness-switch" role="switch" aria-checked="${server.on}" aria-label="${server.name}" data-demo-switch="${server.name}"><span class="coreness-switch-thumb"></span></button>
          <p class="coreness-card-tools" data-demo-tools="${server.name}">${toolsMarkup(server)}</p>
        </li>`

  const modelMarkup = (model) => `
      <li class="coreness-row"><span class="coreness-row-name">${model[0]}</span><span class="coreness-row-meta">${model[1]}</span></li>`

  function markup() {
    return `
<div class="coreness-demo">
  <nav class="coreness-rail" aria-label="Coreness">
    <span class="coreness-brand">Coreness</span>
    <div class="coreness-rail-list">${railMarkup()}</div>
  </nav>
  <div class="coreness-pane">
    <section class="coreness-section" data-demo-panel="general" hidden>
      <h3 class="coreness-section-title">General</h3>
      <div class="coreness-panel coreness-team">
        <div class="coreness-team-head">
          <span class="coreness-card-name">Agent team</span>
          <span class="coreness-status" role="status" aria-live="polite" data-demo-status></span>
        </div>
        <div class="coreness-field">
          <span class="coreness-field-label">Teammates</span>
          <div class="coreness-field-row">
            <input class="coreness-input" type="number" min="1" step="1" value="6" inputmode="numeric" aria-label="Teammates" data-demo-ceiling>
            <button class="coreness-button" type="button" data-demo-save>Save</button>
          </div>
        </div>
        <p class="coreness-hint">A change re-applies the team row: running teammates stop, and the roster and the board recover from the Lead's session log.</p>
        <label class="coreness-check"><input type="checkbox" checked data-demo-team="prompt"><span>Team prompt</span></label>
        <label class="coreness-check"><input type="checkbox" checked data-demo-team="review"><span>Review pass</span></label>
      </div>
    </section>
    <section class="coreness-section" data-demo-panel="mcp">
      <div class="coreness-section-head">
        <h3 class="coreness-section-title">MCP servers</h3>
        <span class="coreness-count" data-demo-count>${countText(SERVERS)}</span>
      </div>
      <p class="coreness-intro">The servers this profile declares in its servers file. The harness owns the connections; this page shows the picture and writes the rows.</p>
      <ul class="coreness-cards">${SERVERS.map(cardMarkup).join('')}
      </ul>
    </section>
    <section class="coreness-section" data-demo-panel="qoder" hidden>
      <h3 class="coreness-section-title">The Qoder route</h3>
      <ul class="coreness-panel coreness-rows">${MODELS.map(modelMarkup).join('')}
      </ul>
      <p class="coreness-hint">Which of these the agent uses, and with what effort, is chosen on the platform's own Models page.</p>
    </section>
    <section class="coreness-section" data-demo-panel="rate" hidden>
      <h3 class="coreness-section-title">Rate limiter</h3>
      <p class="coreness-intro">A ceiling in tokens per minute, attached to a model: the gate holds a request the window cannot take and lets it go marked forced when the wait bound is spent.</p>
      <p class="coreness-hint">Of this run alone: a reload keeps it, a restart wipes it, spend elsewhere is not counted.</p>
      <div class="coreness-panel coreness-limit">
        <span class="coreness-card-name">The limit</span>
        <div class="coreness-limit-cells">
          <div class="coreness-limit-cell"><span class="coreness-field-label">Window</span><span class="coreness-limit-value">60000 <span class="coreness-unit">ms</span></span></div>
          <div class="coreness-limit-cell"><span class="coreness-field-label">Longest wait</span><span class="coreness-limit-value">60000 <span class="coreness-unit">ms</span></span></div>
        </div>
      </div>
      <ul class="coreness-panel coreness-rows">
        <li class="coreness-row"><span class="coreness-row-name">demo/demo-flash</span><span class="coreness-row-meta">120000 tokens per window</span></li>
        <li class="coreness-row"><span class="coreness-row-name">demo/demo-reasoner</span><span class="coreness-row-meta">60000 tokens per window</span></li>
      </ul>
    </section>
  </div>
</div>`
  }

  /** Fills one mount and wires its presses. The state opens as the markup's own and is changed in place. */
  function fill(mount) {
    /* A page may mount the demo once; a second run of the script — a second copy of it, or a reload of the
       same node — must not stack a second panel over the first. */
    if (mount.getAttribute('data-coreness-demo-ready') === 'true') return
    mount.setAttribute('data-coreness-demo-ready', 'true')
    mount.innerHTML = markup()

    const servers = SERVERS.map((server) => ({ ...server }))
    const count = mount.querySelector('[data-demo-count]')

    const syncCount = () => {
      count.textContent = countText(servers)
    }

    const syncServer = (index) => {
      const server = servers[index]
      const button = mount.querySelector(`[data-demo-switch="${server.name}"]`)
      const tools = mount.querySelector(`[data-demo-tools="${server.name}"]`)
      /* The switch's name is the server's name and does not move: `role="switch"` with `aria-checked` carries
         the state, and a name that flips would make every press announce a different control. */
      button.setAttribute('aria-checked', String(server.on))
      tools.innerHTML = toolsMarkup(server)
    }

    servers.forEach((server, index) => {
      const button = mount.querySelector(`[data-demo-switch="${server.name}"]`)
      button.addEventListener('click', () => {
        server.on = !server.on
        syncServer(index)
        syncCount()
      })
    })

    /* The rail: a press shows one section and marks the row that opened it. The section that is not shown
       keeps its markup and its state, so a flip made on one section stands when the reader returns. */
    const tabs = Array.from(mount.querySelectorAll('[data-demo-tab]'))
    const panels = Array.from(mount.querySelectorAll('[data-demo-panel]'))
    const show = (id) => {
      for (const tab of tabs) {
        if (tab.getAttribute('data-demo-tab') === id) tab.setAttribute('aria-current', 'true')
        else tab.removeAttribute('aria-current')
      }
      for (const panel of panels) panel.hidden = panel.getAttribute('data-demo-panel') !== id
    }
    for (const tab of tabs) tab.addEventListener('click', () => show(tab.getAttribute('data-demo-tab')))

    /* The ceiling: the field answers its own value, and the save reports the product's own word for a change
       that landed. A value the field does not take — empty or below one — leaves the press disabled. */
    const ceiling = mount.querySelector('[data-demo-ceiling]')
    const save = mount.querySelector('[data-demo-save]')
    const status = mount.querySelector('[data-demo-status]')
    const syncSave = () => {
      const value = ceiling.value.trim()
      save.disabled = value === '' || Number(value) < 1
    }
    ceiling.addEventListener('input', syncSave)
    let announced = 0
    save.addEventListener('click', () => {
      status.textContent = 'Saved'
      status.setAttribute('data-tone', 'done')
      clearTimeout(announced)
      announced = setTimeout(() => {
        status.textContent = ''
        status.removeAttribute('data-tone')
      }, 2600)
    })
    syncSave()
  }

  const mounts = document.querySelectorAll('[data-coreness-demo]')
  for (const mount of mounts) fill(mount)
})()
