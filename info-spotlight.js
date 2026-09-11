// Landing spotlight: a random useful insight with a matching picture on
// every visit. Content is local and instant; pictures lazy-load.
(function () {
    var SPOTS = [
        {
            text: 'Deep work beats busywork — 90 focused minutes outperform 8 distracted hours.',
            img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=60',
            alt: 'A focused writing desk'
        },
        {
            text: 'The best product decisions come from watching users, not just asking them.',
            img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60',
            alt: 'A team around a table with laptops'
        },
        {
            text: 'Ship small, learn fast — every release is a question asked to reality.',
            img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=60',
            alt: 'A laptop beside a coffee'
        },
        {
            text: 'What gets measured gets managed — pick the one metric that matters.',
            img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60',
            alt: 'Analytics dashboards on screens'
        },
        {
            text: 'Rest is a feature — the brain keeps solving problems while you walk.',
            img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=60',
            alt: 'Sunlight through a forest'
        },
        {
            text: 'Clarity is kindness — write it down, say it plainly, decide out loud.',
            img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=60',
            alt: 'Misty hills at dawn'
        },
        {
            text: 'Done today beats perfect someday — momentum compounds.',
            img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=60',
            alt: 'A mountain peak above the clouds'
        },
        {
            text: 'Stay curious — read outside your field every single week.',
            img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=60',
            alt: 'Library shelves full of books'
        }
    ];

    var img = document.getElementById('spotImg');
    var text = document.getElementById('spotText');
    if (!img || !text) return;

    var pick = SPOTS[Math.floor(Math.random() * SPOTS.length)];
    var preload = new Image();
    preload.onload = function () {
        img.src = pick.img;
        img.alt = pick.alt;
        img.hidden = false;
    };
    preload.onerror = function () { img.hidden = true; };
    text.textContent = pick.text;
    preload.src = pick.img;
})();
