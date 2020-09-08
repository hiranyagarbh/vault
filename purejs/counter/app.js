// set initial
let count = 0;

// select value and all btns
const value = document.querySelector('#value');
const btns = document.querySelectorAll('.btn');

btns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {

        // gets class list
        const styles = e.currentTarget.classList

        // update counter
        if (styles.contains('decrease')) { count --; }
        else if (styles.contains('increase')) { count ++; }
        else if (styles.contains('reset')) { count = 0; }

        // update text color
        if (count > 0) {value.style.color = '#266CAA';}
        if (count < 0) {value.style.color = '#F6461A';}
        if (count === 0) {value.style.color = '#000';}

        // display the counter value
        value.textContent = count;
    })
});
