/* ==========================================================================
   OKSEG · Interações da Home
   Vanilla JS, sem dependências. Tudo degrada com elegância se o JS falhar.
   ========================================================================== */

(function () {
  'use strict';

  var semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. Sombra do cabeçalho ao rolar ----------------------------------- */

  var cabecalho = document.getElementById('cabecalho');

  if (cabecalho) {
    var aoRolar = function () {
      cabecalho.classList.toggle('rolou', window.scrollY > 8);
    };
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
  }

  /* --- 2. Menu mobile ----------------------------------------------------- */

  var painel = document.getElementById('painel-mobile');
  var cortina = document.getElementById('cortina');
  var btnAbrir = document.getElementById('abrir-menu');
  var btnFechar = document.getElementById('fechar-menu');

  if (painel && cortina && btnAbrir && btnFechar) {

    var abrirMenu = function () {
      painel.classList.add('aberto');
      painel.setAttribute('aria-hidden', 'false');
      cortina.hidden = false;
      requestAnimationFrame(function () { cortina.classList.add('aberta'); });
      btnAbrir.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      btnFechar.focus();
    };

    var fecharMenu = function () {
      painel.classList.remove('aberto');
      painel.setAttribute('aria-hidden', 'true');
      cortina.classList.remove('aberta');
      btnAbrir.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      window.setTimeout(function () {
        if (!painel.classList.contains('aberto')) cortina.hidden = true;
      }, 220);
    };

    btnAbrir.addEventListener('click', abrirMenu);
    btnFechar.addEventListener('click', fecharMenu);
    cortina.addEventListener('click', fecharMenu);

    painel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', fecharMenu);
    });

    // acordeão do submenu "Soluções" dentro do painel
    painel.querySelectorAll('.nav-mob-drop__gatilho').forEach(function (botao) {
      botao.addEventListener('click', function () {
        var aberto = botao.getAttribute('aria-expanded') === 'true';
        var lista = botao.nextElementSibling;
        botao.setAttribute('aria-expanded', String(!aberto));
        if (lista) lista.setAttribute('data-aberto', String(!aberto));
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && painel.classList.contains('aberto')) {
        fecharMenu();
        btnAbrir.focus();
      }
    });
  }

  /* --- 2b. Menu suspenso do cabeçalho -------------------------------------- */

  document.querySelectorAll('.nav-drop').forEach(function (drop) {
    var gatilho = drop.querySelector('.nav-drop__gatilho');
    var painel = drop.querySelector('.nav-drop__painel');
    if (!gatilho || !painel) return;

    var fechando = null;

    var abrir = function () {
      window.clearTimeout(fechando);
      painel.hidden = false;
      // força um frame antes da transição, senão o navegador pula a animação
      requestAnimationFrame(function () { painel.classList.add('aberto'); });
      gatilho.setAttribute('aria-expanded', 'true');
    };

    var fechar = function (imediato) {
      painel.classList.remove('aberto');
      gatilho.setAttribute('aria-expanded', 'false');
      window.clearTimeout(fechando);
      fechando = window.setTimeout(function () {
        painel.hidden = true;
      }, imediato ? 0 : 180);
    };

    // ponteiro: abre ao entrar, fecha ao sair (com folga para atravessar o vão)
    drop.addEventListener('mouseenter', abrir);
    drop.addEventListener('mouseleave', function () { fechar(); });

    // teclado: focar o gatilho abre o painel para o Tab alcançar os itens.
    // O gatilho é um link (<a href="solucoes.html">): o clique navega normalmente.
    gatilho.addEventListener('focus', abrir);

    // fecha ao escolher um item
    painel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { fechar(true); });
    });

    // fecha ao sair do menu pelo Tab
    drop.addEventListener('focusout', function (e) {
      if (!drop.contains(e.relatedTarget)) fechar(true);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gatilho.getAttribute('aria-expanded') === 'true') {
        fechar(true);
        gatilho.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) fechar(true);
    });
  });

  /* --- 3. Slider do hero -------------------------------------------------- */

  var hero = document.querySelector('.hero');

  if (hero) {
    var slides = hero.querySelectorAll('.hero__slide');
    var pontos = hero.querySelectorAll('.hero__ponto');
    var atual = 0;
    var timer = null;
    var INTERVALO = 5000;

    var mostrar = function (i) {
      atual = (i + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('ativo', idx === atual);
      });
      pontos.forEach(function (ponto, idx) {
        ponto.setAttribute('aria-current', idx === atual ? 'true' : 'false');
      });
    };

    var iniciar = function () {
      if (semAnimacao || slides.length < 2) return;
      parar();
      timer = window.setInterval(function () { mostrar(atual + 1); }, INTERVALO);
    };

    var parar = function () {
      if (timer) { window.clearInterval(timer); timer = null; }
    };

    pontos.forEach(function (ponto, idx) {
      ponto.addEventListener('click', function () {
        mostrar(idx);
        iniciar();
      });
    });

    hero.addEventListener('mouseenter', parar);
    hero.addEventListener('mouseleave', iniciar);
    hero.addEventListener('focusin', parar);
    hero.addEventListener('focusout', iniciar);

    document.addEventListener('visibilitychange', function () {
      document.hidden ? parar() : iniciar();
    });

    iniciar();
  }

  /* --- 4. FAQ (acordeão) --------------------------------------------------- */

  document.querySelectorAll('.faq__pergunta').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var aberto = botao.getAttribute('aria-expanded') === 'true';
      var resposta = botao.nextElementSibling;

      botao.setAttribute('aria-expanded', String(!aberto));
      if (resposta) resposta.setAttribute('data-aberto', String(!aberto));
    });
  });

  /* --- 5. Ano no rodapé ---------------------------------------------------- */

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* --- 5b. Scroll-reveal (entrada suave dos blocos ao rolar) -------------- */

  if (!semAnimacao) {
    var alvos = document.querySelectorAll(
      '.secao__titulo, .secao__intro, .card-solucao, .modulo, .plano, .tile-sol, ' +
      '.fundador, .sobre__texto, .bloco-publico, .apps__mockup, .diferencial, ' +
      '.passo-como, .tile-parceiro, .faq__item, .faixa-cta__interno, .pagina-cabecalho .container'
    );

    var alturaInicial = window.innerHeight * 0.9;
    var pendentes = [];

    alvos.forEach(function (el) {
      // só anima o que começa abaixo da dobra — evita "flash" no conteúdo já visível
      if (el.getBoundingClientRect().top < alturaInicial) return;
      el.classList.add('reveal');

      // cascata: irmãos do mesmo grupo entram em sequência
      var irmaos = el.parentElement ? el.parentElement.children : [];
      var pos = Array.prototype.indexOf.call(irmaos, el) % 5;
      if (pos > 0) el.classList.add('atraso-' + pos);

      pendentes.push(el);
    });

    // revela por posição de rolagem — robusto contra saltos de âncora,
    // ao contrário do IntersectionObserver, que pode "pular" um elemento.
    var revelar = function () {
      var gatilho = window.innerHeight * 0.92;
      for (var i = pendentes.length - 1; i >= 0; i--) {
        if (pendentes[i].getBoundingClientRect().top < gatilho) {
          pendentes[i].classList.add('visivel');
          pendentes.splice(i, 1);
        }
      }
      if (!pendentes.length) {
        window.removeEventListener('scroll', revelar);
        window.removeEventListener('resize', revelar);
      }
    };

    revelar();
    window.addEventListener('scroll', revelar, { passive: true });
    window.addEventListener('resize', revelar, { passive: true });
  }

  /* --- 5c. Botão "voltar ao topo" ----------------------------------------- */

  var aoTopo = document.createElement('button');
  aoTopo.type = 'button';
  aoTopo.className = 'ao-topo';
  aoTopo.setAttribute('aria-label', 'Voltar ao topo');
  aoTopo.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(aoTopo);

  aoTopo.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: semAnimacao ? 'auto' : 'smooth' });
  });

  var vigiaTopo = function () {
    aoTopo.classList.toggle('visivel', window.scrollY > 600);
  };
  vigiaTopo();
  window.addEventListener('scroll', vigiaTopo, { passive: true });

  /* --- 5d. Placeholders declarados (#TODO-*) ------------------------------
     Enquanto a URL real não chega (CLAUDE.md § 2), esses links apontam para um
     fragmento que não existe na página. Clicar neles suja a barra de endereços,
     cria uma entrada de histórico falsa (o Voltar deixa de sair da página) e,
     em parte dos navegadores, ainda salta a rolagem para o topo.
     O clique é neutralizado sem mexer no HTML — e esta regra some sozinha
     quando o href real substituir o placeholder. */

  document.addEventListener('click', function (e) {
    var alvo = e.target;
    if (!alvo || !alvo.closest) return;
    var link = alvo.closest('a[href^="#TODO-"]');
    if (!link) return;                       // qualquer outro clique segue normal
    e.preventDefault();
    if (window.console && console.warn) {
      console.warn('OKSEG · link ainda sem URL real:', link.getAttribute('href'));
    }
  });

  /* --- 6. Simulador de orçamento (modal de 4 passos → WhatsApp) ------------ */

  var simulador = document.getElementById('simulador');

  if (simulador) {
    var WHATSAPP = '5581992271976';
    var form = document.getElementById('sim-form');
    var passos = form.querySelectorAll('.sim-passo');
    var TOTAL = passos.length;
    var passoAtual = 1;

    var elVoltar  = document.getElementById('sim-voltar');
    var elAvancar = document.getElementById('sim-avancar');
    var elEnviar  = document.getElementById('sim-enviar');
    var elBarra   = document.getElementById('sim-barra');
    var elNum     = document.getElementById('sim-passo-num');
    var elResumo  = document.getElementById('sim-resumo');
    var abridorAnterior = null;

    // --- navegação entre passos ---

    var mostrarPasso = function (n) {
      passoAtual = Math.min(Math.max(n, 1), TOTAL);

      passos.forEach(function (p) {
        p.classList.toggle('ativo', Number(p.dataset.passo) === passoAtual);
      });

      elBarra.style.width = (passoAtual / TOTAL * 100) + '%';
      elNum.textContent = String(passoAtual);

      elVoltar.hidden  = passoAtual === 1;
      elAvancar.hidden = passoAtual === TOTAL;
      elEnviar.hidden  = passoAtual !== TOTAL;

      if (passoAtual === TOTAL) montarResumo();

      // foca o primeiro campo interativo do passo
      var alvo = passos[passoAtual - 1].querySelector('input, button');
      if (alvo) alvo.focus();
    };

    var esconderErro = function () {
      var erro = form.querySelector('[data-erro-passo="' + passoAtual + '"]');
      if (erro) erro.hidden = true;
    };

    var mostrarErro = function () {
      var erro = form.querySelector('[data-erro-passo="' + passoAtual + '"]');
      if (erro) erro.hidden = false;
    };

    // --- validação por passo ---

    var soDigitos = function (t) { return (t || '').replace(/\D/g, ''); };

    var validarPasso = function () {
      if (passoAtual === 1) {
        return !!form.querySelector('input[name="perfil"]:checked');
      }
      if (passoAtual === 2) {
        return form.querySelectorAll('input[name="solucoes"]:checked').length > 0;
      }
      if (passoAtual === 3) {
        var nome = form.nome.value.trim();
        var tel = soDigitos(form.telefone.value);
        return nome.length >= 2 && tel.length >= 10 && tel.length <= 13;
      }
      return true;
    };

    // --- resumo e mensagem ---

    var coletar = function () {
      var perfil = form.querySelector('input[name="perfil"]:checked');
      var solucoes = Array.prototype.map.call(
        form.querySelectorAll('input[name="solucoes"]:checked'),
        function (c) { return c.value; }
      );
      return {
        perfil: perfil ? perfil.value : '',
        solucoes: solucoes,
        nome: form.nome.value.trim(),
        telefone: form.telefone.value.trim()
      };
    };

    var montarResumo = function () {
      var d = coletar();
      elResumo.innerHTML =
        '<dt>Local</dt><dd>' + escapar(d.perfil) + '</dd>' +
        '<dt>Soluções</dt><dd>' + escapar(d.solucoes.join(', ')) + '</dd>' +
        '<dt>Nome</dt><dd>' + escapar(d.nome) + '</dd>' +
        '<dt>WhatsApp</dt><dd>' + escapar(d.telefone) + '</dd>';
    };

    var escapar = function (s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    };

    var montarMensagem = function () {
      var d = coletar();
      var linhas = [
        'Olá! Vim pelo site e quero um orçamento.',
        '',
        '• Local: ' + d.perfil,
        '• Soluções: ' + d.solucoes.join(', '),
        '• Nome: ' + d.nome,
        '• WhatsApp: ' + d.telefone
      ];
      return linhas.join('\n');
    };

    // --- abrir / fechar o modal ---

    var abrir = function (abridor) {
      abridorAnterior = abridor || null;
      simulador.hidden = false;
      requestAnimationFrame(function () { simulador.classList.add('aberto'); });
      document.body.style.overflow = 'hidden';
      passoAtual = 1;
      mostrarPasso(1);
    };

    var fechar = function () {
      simulador.classList.remove('aberto');
      document.body.style.overflow = '';
      window.setTimeout(function () { simulador.hidden = true; }, 220);
      if (abridorAnterior && abridorAnterior.focus) abridorAnterior.focus();
    };

    // --- eventos ---

    document.querySelectorAll('[data-abrir-simulador]').forEach(function (botao) {
      botao.addEventListener('click', function (e) {
        e.preventDefault();
        abrir(botao);
      });
    });

    simulador.querySelectorAll('[data-fechar-simulador]').forEach(function (el) {
      el.addEventListener('click', fechar);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !simulador.hidden) fechar();
    });

    elAvancar.addEventListener('click', function () {
      if (!validarPasso()) { mostrarErro(); return; }
      esconderErro();
      mostrarPasso(passoAtual + 1);
    });

    elVoltar.addEventListener('click', function () {
      esconderErro();
      mostrarPasso(passoAtual - 1);
    });

    // some com o erro assim que o usuário corrige
    form.addEventListener('change', esconderErro);
    form.addEventListener('input', esconderErro);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validarPasso()) { mostrarErro(); return; }
      var url = 'https://wa.me/' + WHATSAPP + '?text=' +
                encodeURIComponent(montarMensagem());
      window.open(url, '_blank', 'noopener');
      fechar();
    });

    // trava o foco dentro do modal (Tab não escapa para a página atrás)
    simulador.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var foco = simulador.querySelectorAll(
        'a[href], button:not([hidden]):not([disabled]), input:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"])'
      );
      var visiveis = Array.prototype.filter.call(foco, function (el) {
        return el.offsetParent !== null;
      });
      if (!visiveis.length) return;
      var primeiro = visiveis[0];
      var ultimo = visiveis[visiveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault(); ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault(); primeiro.focus();
      }
    });
  }

})();
