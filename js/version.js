<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planeamento: Viagem a Paris 2025</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" rel="stylesheet">
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js'></script>
    <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core/locales/pt-br.global.min.js'></script>
    
<!-- Favicon (Versão Corrigida) -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<!-- Fim Favicon -->

    <style>
        /* CSS para a Galeria de Destaques */
        .highlight-card {
            aspect-ratio: 1 / 1; /* Proporção quadrada por defeito */
        }
        .highlight-card.col-span-2 {
            aspect-ratio: 2 / 1; /* Proporção retangular para os cartões duplos */
        }
    
        /* Estilos base (para telemóveis) */
        body { font-family: 'Poppins', sans-serif; background-color: #f0f4f8; font-size: 14px; }
        .main-title { font-size: 2rem; line-height: 2.5rem; }
        .section-title { font-size: 1.5rem; line-height: 2rem; }
        .countdown-number { font-size: 2.25rem; }

        /* Regras para ecrãs maiores (md: 768px em diante) */
        @media (min-width: 768px) {
            body { font-size: 16px; }
            .main-title { font-size: 3rem; line-height: 1; }
            .section-title { font-size: 1.875rem; line-height: 2.25rem; }
            .countdown-number { font-size: 2.25rem; }
        }
        .checklist-item input:checked + label { text-decoration: line-through; color: #9ca3af; }
        .checklist-item input:checked + label .icon-box { background-color: #16a34a; color: white; }
    </style>
</head>
<body class="text-gray-800">
    <div class="container mx-auto p-4 md:p-8 max-w-5xl">
        <header class="text-center py-12 rounded-2xl shadow-lg mb-12 bg-cover bg-center" style="background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFyaXN8ZW58MHx8MHx8fDA%3D');">
            <h1 class="main-title font-bold text-white mb-4">Rumo a Paris!</h1>
            <p class="text-lg text-gray-200 mb-6">A nossa aventura aproxima-se...</p>
            <div id="countdown" class="flex justify-center space-x-4 md:space-x-8 text-white">
                <div><span id="days" class="countdown-number font-bold">00</span><span class="block text-sm">Dias</span></div>
                <div><span id="hours" class="countdown-number font-bold">00</span><span class="block text-sm">Horas</span></div>
                <div><span id="minutes" class="countdown-number font-bold">00</span><span class="block text-sm">Minutos</span></div>
                <div><span id="seconds" class="countdown-number font-bold">00</span><span class="block text-sm">Segundos</span></div>
            </div>
        </header>
        <section class="mb-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <a href="guia.html" class="block bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                    <div class="flex items-center text-green-800 mb-3"><i class="fa-solid fa-map-location-dot text-2xl mr-3"></i><h3 class="text-xl font-bold">Guia Visual</h3></div>
                    <p class="text-gray-600">O nosso plano com imagens, curiosidades e destaques.</p>
                </a>
                <a href="roteiro.html" class="block bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                     <div class="flex items-center text-blue-800 mb-3"><i class="fa-solid fa-list-ol text-2xl mr-3"></i><h3 class="text-xl font-bold">Roteiro Detalhado</h3></div>
                    <p class="text-gray-600">A versão com horários, transportes e todas as informações.</p>
                </a>
                <a href="orcamento.html" class="block bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                     <div class="flex items-center text-red-800 mb-3"><i class="fa-solid fa-euro-sign text-2xl mr-3"></i><h3 class="text-xl font-bold">Orçamento Detalhado</h3></div>
                    <p class="text-gray-600">Consulta os custos estimados por grupo e bilhetes.</p>
                </a>
             </div>
        </section>
        <section class="mb-12">
            <h2 class="section-title font-bold text-gray-800 mb-6 text-center">Próximos Passos</h2>
            <div id="timeline-container" class="space-y-8"></div>
        </section>
        
        <section class="mb-12">
            <h2 class="section-title font-bold text-gray-800 mb-6 text-center">Destaques da Nossa Viagem</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <a href="guia.html#day1" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg col-span-2 aspect-w-2 aspect-h-1">
                    <img src="https://res.cloudinary.com/dtljonz0f/image/upload/f_auto/q_auto/v1/gc-v1/paris/3%20giorni%20a%20Parigi%20Tour%20Eiffel?_a=BAVAZGE70" alt="Torre Eiffel" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-xl font-bold">Torre Eiffel</h3>
                </a>
                <a href="guia.html#day4" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
                    <img src="https://www.relaisdulouvre.com/wp-content/uploads/2024/03/Louvre1-1024x682.jpg" alt="Museu do Louvre" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-lg font-bold">Museu do Louvre</h3>
                </a>
                <a href="guia.html#day3" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
                    <img src="https://paisageiro.com/wp-content/uploads/2023/03/organizacao-jardins-de-versalhes1-1024x683.jpg" alt="Palácio de Versalhes" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-lg font-bold">Palácio de Versalhes</h3>
                </a>
                <a href="guia.html#day2" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg col-span-2 aspect-w-2 aspect-h-1">
                    <img src="https://images.adsttc.com/media/images/671f/6aa2/3dfd/b479/8aac/78a7/large_jpg/notre-dame-de-paris-announces-reopening-date-and-proposes-constroversial-entrance-fee_2.jpg?1730112234" alt="Catedral de Notre-Dame" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-xl font-bold">Catedral de Notre-Dame</h3>
                </a>
                <a href="guia.html#day5" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
                    <img src="https://www.timographie360.fr/photos/realisations/sliders/hd/visite-virtuelle-sainte-chapelle-02_518.jpg" alt="Sainte-Chapelle" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-lg font-bold">Sainte-Chapelle</h3>
                </a>
                <a href="guia.html#day3" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
                    <img src="https://www.civitatis.com/f/francia/paris/free-tour-montmartre-589x392.jpg" alt="Montmartre" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-lg font-bold">Montmartre</h3>
                </a>
                <a href="guia.html#day2" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
                    <img src="https://officiel-galeries-musees.fr/wp-content/uploads/2020/08/orsay-musee.jpg" alt="Musée d'Orsay" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-lg font-bold">Musée d'Orsay</h3>
                </a>
                <a href="guia.html#day2" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
                    <img src="https://www.tudosobreparis.com/f/francia/paris/guia/campos-eliseos-m.jpg" alt="Champs-Élysées" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-lg font-bold">Champs-Élysées</h3>
                </a>
                <a href="guia.html#day4" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
                    <img src="https://www.franceguide.info/wp-content/uploads/sites/18/paris-galeries-lafayette.jpg" alt="Galeries Lafayette" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-lg font-bold">Galeries Lafayette</h3>
                </a>
                <a href="guia.html#day5" class="highlight-card group block relative rounded-2xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
                    <img src="https://midias-turismo.eurodicas.com.br/wp-content/uploads/2025/02/quartier-latin-1-1200x800.jpg.webp" alt="Quartier Latin" class="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 class="absolute bottom-4 left-4 text-white text-lg font-bold">Quartier Latin</h3>
                </a>
            </div>
        </section>        
        
        <section class="mb-12">
            <h2 class="section-title font-bold text-gray-800 mb-6 text-center">Calendário</h2>
            <div class="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                <div id='calendar'></div>
            </div>
        </section>
        <section class="mb-12">
            <h2 class="section-title font-bold text-gray-800 mb-6 text-center">Checklist de Preparação</h2>
            <div class="bg-white p-6 rounded-2xl shadow-lg space-y-4">
                <div class="checklist-item flex items-center"><input type="checkbox" id="check-aviao" class="hidden"><label for="check-aviao" class="flex items-center cursor-pointer w-full"><span class="icon-box w-8 h-8 mr-4 flex items-center justify-center border-2 border-gray-300 rounded-md transition-colors"><i class="fa-solid fa-check"></i></span><span class="text-lg">Reservar voos</span></label></div>
                <div class="checklist-item flex items-center"><input type="checkbox" id="check-alojamento" class="hidden"><label for="check-alojamento" class="flex items-center cursor-pointer w-full"><span class="icon-box w-8 h-8 mr-4 flex items-center justify-center border-2 border-gray-300 rounded-md transition-colors"><i class="fa-solid fa-check"></i></span><span class="text-lg">Reservar alojamento</span></label></div>
                <div class="checklist-item flex items-center"><input type="checkbox" id="check-mochilas" class="hidden"><label for="check-mochilas" class="flex items-center cursor-pointer w-full"><span class="icon-box w-8 h-8 mr-4 flex items-center justify-center border-2 border-gray-300 rounded-md transition-colors"><i class="fa-solid fa-check"></i></span><span class="text-lg">Compra de mochilas</span></label></div>
                <div class="checklist-item flex items-center"><input type="checkbox" id="check-seguro" class="hidden"><label for="check-seguro" class="flex items-center cursor-pointer w-full"><span class="icon-box w-8 h-8 mr-4 flex items-center justify-center border-2 border-gray-300 rounded-md transition-colors"><i class="fa-solid fa-check"></i></span><span class="text-lg">Todos têm cartões de saúde europeus?</span></label></div>
                <div class="checklist-item flex items-center"><input type="checkbox" id="check-transportes" class="hidden"><label for="check-transportes" class="flex items-center cursor-pointer w-full"><span class="icon-box w-8 h-8 mr-4 flex items-center justify-center border-2 border-gray-300 rounded-md transition-colors"><i class="fa-solid fa-check"></i></span><span class="text-lg">Bilhetes transportes públicos</span></label></div>
            </div>
        </section>
        
        <section class="mb-12">
            <h2 class="section-title font-bold text-gray-800 mb-6 text-center">Resumo de Bilhetes a comprar</h2>
            <div id="ticket-timeline-container" class="space-y-6"></div>
        </section>
    </div>
    <script src="https://www.gstatic.com/firebasejs/9.6.7/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.7/firebase-database-compat.js"></script>
    <script>
        const countdownDate = new Date(2025, 8, 19, 6, 0, 0).getTime();
        const x = setInterval(function() {
            const now = new Date().getTime();
            const distance = countdownDate - now;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if (document.getElementById("days")) {
                document.getElementById("days").innerText = days.toString().padStart(2, '0');
                document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
                document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
                document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
            }
            if (distance < 0) {
                clearInterval(x);
                if (document.getElementById("countdown")) {
                    document.getElementById("countdown").innerHTML = "<div class='text-center w-full'><p class='text-2xl font-bold'>A VIAGEM COMEÇOU! BON VOYAGE!</p></div>";
                }
            }
        }, 1000);
        
        const firebaseConfig = {
          apiKey: "AIzaSyAt7jAk5r2tqSdyTf2m7MUebd_t7bbDTJk",
          authDomain: "planeamento-viagem-paris.firebaseapp.com",
          databaseURL: "https://planeamento-viagem-paris-default-rtdb.europe-west1.firebasedatabase.app",
          projectId: "planeamento-viagem-paris",
          storageBucket: "planeamento-viagem-paris.appspot.com",
          messagingSenderId: "121000897121",
          appId: "1:121000897121:web:75662c01dc56926bf61820"
        };
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        const planningEvents = [
            { title: 'Comprar bilhetes para o Museu do Louvre', date: '2025-06-18', description: 'Comprar para o dia 22 de Setembro (Segunda-feira).', status: 'complete', color: '#16a34a' },
            { title: 'Comprar bilhetes para a Museu D Orsay', date: '2025-06-21', description: 'Em principio em julho já é possivel comprar os bilhetes. Verificar disponibilidade.', status: 'complete', color: '#16a34a' },
            { title: 'Comprar bilhetes para Versailles', date: '2025-06-23', description: 'A partir desta data já é possivel comprar para o dia 21 de setembro.', status: 'complete', color: '#16a34a' },
            { title: 'Comprar bilhetes para a Sainte-Chapelle', date: '2025-07-01', description: 'Em principio em julho já é possivel comprar os bilhetes. Verificar disponibilidade.', status: 'complete', color: '#16a34a' },
            { title: 'Comprar bilhetes para a Torre Eiffel', date: '2025-07-20', description: 'Comprar ás 23h!! (0.00h em Paris) Os bilhetes ficam disponíveis 60 dias antes. Comprar para o dia 19 de Setembro (Sexta-feira).', status: 'complete', color: '#16a34a' },
            { title: 'Comprar bilhetes para a Ópera Garnier', date: '2025-07-23', description: 'Fazer a compra ás 23h!! Comprar para o dia 22 de Setembro (Segunda-feira).', status: 'pending', color: '#dc2626' },
            { title: 'Fazer pagamento da casa de Paris', date: '2025-08-25', description: 'Fazer o pagamento final da reserva.', status: 'pending', color: '#ea580c' },
            { title: 'Reserva para entrada sem filas na Notre-Dame', date: '2025-09-19', description: 'A reserva só pode ser feita umas horas antes. Irá ser dificil apanhar um slot disponível.', status: 'pending', color: '#ea580c' },
            { title: 'VIAGEM!', date: '2025-09-19', endDate: '2025-09-24', description: 'De 19 a 23 de Setembro.', status: 'complete', color: '#16a34a' }
        ];
        
        const tripItinerary = [
            { day: 'Dia 1', date: '19/09', theme: 'Chegada e Torre Eiffel', ticketedVenues: [
                { name: 'Torre Eiffel', icon: 'fa-tower-observation', status: 'complete', openingHours: '09:00 - 23:45', openDays: 'Todos os dias' }] },
            { day: 'Dia 2', date: '20/09', theme: 'Coração Histórico', ticketedVenues: [
                { name: 'Musée dOrsay', icon: 'fa-gem', status: 'complete', openingHours: '09:00 - 17:00', openDays: 'Todos os dias (verificar feriados)' }] },
            { day: 'Dia 3', date: '21/09', theme: 'Realeza e Arte Boémia', ticketedVenues: [
                { name: 'Palácio de Versalhes', icon: 'fa-crown', status: 'complete', openingHours: '09:00 - 18:30 (Palácio)', openDays: 'Fecha às Segundas' }] },
            { day: 'Dia 4', date: '22/09', theme: 'Imersão em Arte', ticketedVenues: [
                { name: 'Museu do Louvre', icon: 'fa-landmark-dome', status: 'complete', openingHours: '09:00 - 18:00', openDays: 'Fecha às Terças' }, 
                { name: 'Ópera Garnier', icon: 'fa-masks-theater', status: 'pending', openingHours: '10:00 - 17:00', openDays: 'Todos os dias (pode fechar para eventos)' }] },
            { day: 'Dia 5', date: '23/09', theme: 'Despedida e Regresso', ticketedVenues: [
                 { name: 'Sainte-Chapelle', icon: 'fa-gem', status: 'complete', openingHours: '09:00 - 17:00', openDays: 'Todos os dias (verificar feriados)' } ] }
        ];

        function setupChecklist() {
            const checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');
            const checklistRef = database.ref('checklist');
            checklistRef.on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) { checklistItems.forEach(item => { if (data[item.id] !== undefined) { item.checked = data[item.id]; } }); }
            });
            checklistItems.forEach(item => { item.addEventListener('change', (e) => { checklistRef.child(e.target.id).set(e.target.checked); }); });
        }
        
        function renderTimeline() {
            const timelineContainer = document.getElementById('timeline-container');
            if (!timelineContainer) return;
            timelineContainer.innerHTML = '';
            planningEvents.forEach(event => {
                if (event.title === 'VIAGEM!') return;
                const eventDate = new Date(event.date + 'T00:00:00');
                const month = eventDate.toLocaleString('pt-PT', { month: 'short' }).toUpperCase().replace('.', '');
                const day = eventDate.getDate();
                const isComplete = event.status === 'complete';
                const itemHTML = `<div class="flex items-start space-x-4 ${isComplete ? 'opacity-60' : ''}"><div class="flex flex-col items-center"><span class="text-lg font-semibold ${isComplete ? 'text-gray-500' : 'text-green-700'}">${month}</span><span class="text-2xl font-bold ${isComplete ? 'text-gray-500' : 'text-green-700'}">${day}</span></div><div class="bg-white p-4 rounded-lg shadow-md flex-1"><h3 class="font-semibold text-lg ${isComplete ? 'line-through' : ''}">${event.title}</h3><p class="text-sm text-gray-600">${event.description}</p><div class="mt-2 text-sm font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}"><i class="fa-solid ${isComplete ? 'fa-check-circle' : 'fa-hourglass-half'} mr-2"></i>${isComplete ? 'Concluído' : 'Pendente'}</div></div></div>`;
                timelineContainer.innerHTML += itemHTML;
            });
        }

        function renderCalendar() {
            const calendarEl = document.getElementById('calendar');
            if (!calendarEl) return;
            const modal = document.getElementById('event-modal');
            const modalTitle = document.getElementById('modal-title');
            const modalDescription = document.getElementById('modal-description');
            const modalCloseBtn = document.getElementById('modal-close-btn');
            const calendarEvents = planningEvents.map(event => ({ title: event.title, start: event.date, end: event.endDate, backgroundColor: event.color, borderColor: event.color, allDay: true, extendedProps: { description: event.description || 'Não há detalhes adicionais.' } }));
            const calendar = new FullCalendar.Calendar(calendarEl, { initialView: 'dayGridMonth', locale: 'pt-br', headerToolbar: { left: 'prev,next today', center: 'title', right: '' }, events: calendarEvents, eventClick: function(info) { info.jsEvent.preventDefault(); if(modal) { modalTitle.textContent = info.event.title; modalDescription.textContent = info.event.extendedProps.description; modal.classList.remove('hidden');} } });
            function closeModal() { if(modal) modal.classList.add('hidden'); }
            if(modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
            if(modal) modal.addEventListener('click', function(e) { if (e.target === modal) { closeModal(); } });
            calendar.render();
        }

        function renderTicketTimeline() {
            const container = document.getElementById('ticket-timeline-container');
            if (!container) return;
            container.innerHTML = '';
            tripItinerary.forEach(day => {
                let venuesHTML = '';
                if (day.ticketedVenues.length > 0) {
                    venuesHTML = `<ul class="mt-3 space-y-4">` + day.ticketedVenues.map(venue => {
                        const isComplete = venue.status === 'complete';
                        return `
                        <li class="p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <i class="fa-solid ${isComplete ? 'fa-check-circle text-green-500' : 'fa-hourglass-half text-yellow-500'} w-6 text-center mr-3"></i>
                                    <span class="font-semibold ${isComplete ? 'line-through text-gray-400' : 'text-gray-800'}">${venue.name}</span>
                                </div>
                                <i class="fa-solid ${venue.icon} text-xl text-gray-400"></i>
                            </div>
                            <div class="mt-2 pl-9 text-sm text-gray-600 space-y-1">
                                <div class="flex items-start"><i class="fa-regular fa-calendar-days w-6 text-center mr-1 pt-1"></i><span>${venue.openDays || 'Não especificado'}</span></div>
                                <div class="flex items-start"><i class="fa-regular fa-clock w-6 text-center mr-1 pt-1"></i><span>${venue.openingHours || 'Não especificado'}</span></div>
                            </div>
                        </li>`;
                    }).join('') + `</ul>`;
                } else {
                    venuesHTML = `<p class="mt-2 text-gray-500 italic">Nenhum bilhete a comprar para este dia.</p>`;
                }
                const dayHTML = `
                    <div class="bg-white p-6 rounded-2xl shadow-lg">
                        <div class="flex items-center border-b pb-3">
                            <div class="text-center w-16"><p class="text-xl font-bold text-gray-800">${day.day}</p><p class="text-sm text-gray-500">${day.date}</p></div>
                            <div class="pl-4 border-l ml-4"><h4 class="font-semibold text-lg text-gray-900">${day.theme}</h4></div>
                        </div>
                        ${venuesHTML}
                    </div>`;
                container.innerHTML += dayHTML;
            });
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            setupChecklist();
            renderTimeline();
            renderCalendar();
            renderTicketTimeline();
        });
    </script>
    <div id="event-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-md relative">
            <button id="modal-close-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition">
                <i class="fa-solid fa-xmark fa-2x"></i>
            </button>
            <h3 id="modal-title" class="text-2xl font-bold text-gray-800 mb-4">Título do Evento</h3>
            <p id="modal-description" class="text-gray-600">Descrição detalhada do evento irá aparecer aqui.</p>
        </div>
    </div>
</body>
</html>
