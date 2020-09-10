// generic ajax request will return the data in following format
const reviews = [
  {
    id: 1,
    name: "jeevan mosley",
    job: "web developer",
    img:
      "https://res.cloudinary.com/diqqf3eq2/image/upload/v1586883334/person-1_rfzshl.jpg",
      text:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptates, laudantium. Quae nostrum accusamus optio voluptas obcaecati animi natus tempora quidem quia culpa harum.",
  },
  {
    id: 2,
    name: "jody johnson",
    job: "designer",
    img:
      "https://res.cloudinary.com/diqqf3eq2/image/upload/v1586883409/person-2_np9x5l.jpg",
    text:
      "Helvetica artisan kinfolk thundercats lumbersexual blue bottle. Disrupt glossier gastropub deep v vice franzen hell of brooklyn twee enamel pin fashion axe.photo booth jean shorts artisan narwhal.",
  },
  {
    id: 3,
    name: "Daniella Downs",
    job: "sales intern",
    img:
      "https://res.cloudinary.com/diqqf3eq2/image/upload/v1586883417/person-3_ipa0mj.jpg",
    text:
      "Sriracha literally flexitarian irony, vape marfa unicorn. Glossier tattooed 8-bit, fixie waistcoat offal activated charcoal slow-carb marfa hell of pabst raclette post-ironic jianbing swag.",
  },
  {
    id: 4,
    name: "Samara Walton",
    job: "CTO",
    img:
      "https://res.cloudinary.com/diqqf3eq2/image/upload/v1586883423/person-4_t9nxjt.jpg",
    text:
      "Edison bulb put a bird on it humblebrag, marfa pok pok heirloom fashion axe cray stumptown venmo actually seitan. VHS farm-to-table schlitz, edison bulb pop-up 3 wolf moon tote bag street art shabby chic. ",
  },
];

// get HTML elements
const img = document.getElementById('person-img');
const author = document.getElementById('author');
const job = document.getElementById('job');
const info = document.getElementById('info');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// set starting item
let curItem = 0;

// load initial item
window.addEventListener('DOMContentLoaded', function() {
  showPerson();
})

// show person based on item
function showPerson() {
  img.src = reviews[curItem].img; 
  author.textContent = reviews[curItem].name;
  job.textContent = reviews[curItem].job;
  info.textContent = reviews[curItem].text;
}

// shoe next person
nextBtn.addEventListener('click', function() {
  curItem++;
  if (curItem > reviews.length - 1) {
    curItem = 0
  }
  showPerson(curItem);
});

// shoe prev person
prevBtn.addEventListener('click', function() {
  curItem--;
  if (curItem < 0) {
    curItem = reviews.length - 1;
  }
  showPerson(curItem);
});