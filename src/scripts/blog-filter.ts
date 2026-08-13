const controls = document.querySelector<HTMLElement>('[data-blog-filters]');
const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-format]'));

if (controls && cards.length > 0) {
  const buttons = Array.from(controls.querySelectorAll<HTMLButtonElement>('button[data-filter]'));

  const applyFilter = (format: string, updateUrl: boolean) => {
    const activeFormat = format === 'article' || format === 'note' ? format : 'all';
    for (const card of cards) {
      card.hidden = activeFormat !== 'all' && card.dataset.format !== activeFormat;
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === activeFormat));
    }

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (activeFormat === 'all') url.searchParams.delete('format');
      else url.searchParams.set('format', activeFormat);
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  for (const button of buttons) {
    button.addEventListener('click', () => applyFilter(button.dataset.filter ?? 'all', true));
  }

  applyFilter(new URL(window.location.href).searchParams.get('format') ?? 'all', false);
}
