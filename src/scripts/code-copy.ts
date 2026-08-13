if (typeof navigator.clipboard?.writeText === 'function') {
  document.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
    if (pre.querySelector('.code-copy')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy type-metadata';
    button.textContent = 'Copier';
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.textContent ?? '';
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copié';
      window.setTimeout(() => {
        button.textContent = 'Copier';
      }, 1600);
    });
    pre.append(button);
  });
}
