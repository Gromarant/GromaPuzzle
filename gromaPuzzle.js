let video = null;
let canvas = null;
let context = null;
let scaler = 0.8;
let size = { x:0, y:0, width:0, height:0, rows: 6, columns: 6 };
let pieces = [];
let selectedPiece = null;
let location = 
    {
        x: eve.touches[0].clientX,
        Y: eve.touches[0].clientY,
    };

const main = () => {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    
    let promise = navigator.mediaDevices.getUserMedia({ video:true });
    promise.then( function(signal) {
        video = document.createElement('video');
        video.srcObject = signal;
        video.play();
        video.onloadeddata = function() {
            handleResize();
            handlePieces( size.rows, size.columns );
            updateCanvas();
        }
    }).catch( function( err ) {
        alert('Camera error: ' + err );
    });
};

const addEventListeners = () => {
    canvas.addEventListener( 'mousedown', onMouseDown );
    canvas.addEventListener( 'mousemove', onMouseMove );
    canvas.addEventListener( 'mouseup', onMouseUp );

    canvas.addEventListener( 'touchstart', onTouchStart );
    canvas.addEventListener( 'touchmove', onTouchMove );
    canvas.addEventListener( 'touchend', onTouchEnd);
};

const onMouseDown = ( eve ) => {
    selectedPiece = getPressedPiece( eve );

    if( selectedPiece !== null ) {
        const pieceIndex = pieces.indexOf( selectedPiece );

        if( pieceIndex > -1 ) {
            pieces.splice( pieceIndex, 1 );
            pieces.push( selectedPiece )
        }

        selectedPiece.offset = {
            x: eve.x - selectedPiece.x,
            y: eve.y - selectedPiece.y,
        };
    };
};

const onMouseMove = ( eve ) => {

    if( selectedPiece !== null ) {
        selectedPiece.x = eve.x - selectedPiece.offser.x,
        selectedPiece.y = eve.y - selectedPiece.offser.y
    };
};

const onMouseUp = ( eve ) => {
    if( selectedPiece.isClose() ) {
        selectedPiece.snap();
    }
    selectedPiece = null;
};

const touchstart = ( eve ) => onMouseDown( location );

const touchmove = () => onMouseMove( location );

const touchend = () => onMouseUp();


const getPressedPiece = ( location ) => {

    for( let i = pieces.length - 1; i >= 0; i-- ) {
        if( location.x > pieces[i].x && location.x < pieces[i].x + pieces[i].width &&
            location.y > pieces[i].y && location.y < pieces[i].y + pieces[i].height ) {
                return pieces[i]
            };
    };
    return null;
};

const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let resizer = scaler*
    Math.min(
        window.innerWidth/video.videoWidth,
        window.innerHeight/video.videoHeight,
    );
    size.width = resizer*video.videoWidth;
    size.height = resizer*video.videoHeight;
    size.x = window.innerWidth/2-size.width/2;
    size.y = window.innerHeight/2-size.height/2;
};

const updateCanvas = () => {
    context.clearRect( 0, 0, canvas.width, canvas.height );

    context.globalAlpha = 0.5;
    context.drawImage(video,
        size.x, size.y,
        size.width, size.height );
    context.globalAlpha = 1;
    
    for( let i = 0; i < pieces.length; i++ ) {
        pieces[i].draw( context );
    };
    window.requestAnimationFrame( updateCanvas );
};

const handlePieces = ( rows, cols ) => {
    size.rows = rows;
    size.columns = cols;

    pieces = [];
    for( let i = 0; i < size.rows; i++ ) {
        for( let x = 0; x < size.rows; x++ ) {
            pieces.push( new Pieces( i, x ));
        };
    };
};

const randomPieces = () => {
    for( let i = 0; i < pieces.length; i++ ) {
        let location = 
        {
            x: Math.random() * ( canvas.width - pieces[i].width ),
            y: Math.random() * ( canvas.height - pieces[i].height ),
        };
        pieces[i].x = location.x;
        pieces[i].y = location.y;
    };
};
class Pieces {
    constructor( rowIndex, colIndex ) {
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.x = size.x + size.width * this.colIndex / size.columns;
        this.y = size.y + size.height * this.rowIndex / size.rows;
        this.width = size.width / size.columns;
        this.height = size.width / size.rows;
        this.xCorrect = this.x;
        this.yCorrect = this.y;
    }
    draw( context ) {
        context.beginPath();
        context.drawImage( video,
            this.colIndex * video.videoWidth / size.columns,
            this.rowIndex * video.videoHeight / size.rows,
            video.videoWidth / size.columns,
            video.videoHeight / size.rows,
            this.x,
            this.y,
            this.width,
            this.height);

        context.rect( this.x, this.y, this.width, this.height);
        context.stroke();
    };
    isClose() {
        if( distance(
            { x: this.x, y: this.y },
            { x: this.xCorrect, y: this.yCorrect }
        ) < this.width / 3 ) {
            return true;
        };
        return false;
    };
    snap() {
        this.x = this.xCorrect;
        this.y = this.yCorrect;
    }
};

const distance = ( p1, p2 ) => {
    return Math.sqrt(
        ( p1.x - p2.x ) * ( p1.x - p2.x ) +
        ( p1.y - p2.y ) * ( p1.y - p2.y )
    );
};