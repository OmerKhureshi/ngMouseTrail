angular
    .module('app')
    .controller('ctrl', function ($scope, $interval) {
        $scope.numCells = 20;
        $scope.matrix = [];
        $scope.gameActive = false;
        $scope.gameOver = false;
        $scope.gameOverExitContiainer = false;
        $scope.gameWon = false;
        $scope.score = 0;
        $scope.timeSoFar = 0;
        $scope.newMaxScore = false;
        $scope.finalScore = 0;
        let scaleFactor = 1.3;

        let endRow = 0;
        let endCol = 0;

        // Matrix value meaning
        // 0 - don't go = red
        // 1 - must go = yellow
        // 2 - went where must not go = pink.
        // 3 - went where must  go = green.

        $scope.danger = 0;
        $scope.dangerColor = "#f2a2d7";

        $scope.safe = 1;
            $scope.safeColor = "#a1f1eb";

        $scope.dangerTrodden = 2;
        $scope.dangerTroddenColor = "#e22d66";

        $scope.safeTrodden = 3;
        // $scope.safeTroddenColor = "#a2ef8d";
        $scope.safeTroddenColor = "#7bd389";


        // Initialization.
        for (var i=0; i < $scope.numCells; i++){
            $scope.matrix[i] = [];
            for (var j=0; j < $scope.numCells; j++){
                $scope.matrix[i][j] = $scope.danger;
                // console.log("i: " + i + " j: " + j + " ==> " + $scope.matrix[i][j]);
            }

        }

        $scope.matrix[0][0] = $scope.safeTrodden;

        // Set CSS.
        $scope.boxContainerWidth = $scope.numCells * ( 20 + 2 );

        $scope.boxContainerStyle = {
            "width": $scope.boxContainerWidth + "px"
        };

        /*

                // Initialize safe path.
                let row = 0; let col = 0;
                $scope.matrix[0][0] = $scope.safeTrodden;

                while (row < $scope.numCells-1 && col < $scope.numCells-1) {
                    let dir = Math.floor(Math.random() * 2);

                    if (dir === 0) row++;
                    else col++;

                    $scope.matrix[row][col] = $scope.safe;
                }

                endRow = row;
                endCol = col;
        */


        // Define color change rules.
        $scope.setStyling = function (row, col) {
            if ($scope.matrix[row][col] === $scope.danger) {
                return $scope.dangerColor;
            } else if ($scope.matrix[row][col] === $scope.safe) {
                return $scope.safeColor;
            } else if ($scope.matrix[row][col] === $scope.dangerTrodden) {
                return $scope.dangerTroddenColor;
            } else if ($scope.matrix[row][col] === $scope.safeTrodden) {
                return $scope.safeTroddenColor;
            }
        };


        // Define mouse enter rules.
        $scope.onMouseEnter = function (e, row, col) {

            if (row === 0 && col === 0) {
                e.target.style.transform = "scale(" + scaleFactor + ")";
                $scope.gameActive = true;
                $scope.startTimer();
            } else if ($scope.gameActive && row === endRow && col === endCol) {
                e.target.style.transform = "scale(" + scaleFactor + ")";
                $scope.matrix[row][col] = $scope.safeTrodden;
                $scope.gameActive = false;
                $scope.gameWon = true;
                $interval.cancel($scope.promise);
                $scope.setScore();
            }

            if ($scope.gameActive) {
                if ($scope.matrix[row][col] === $scope.danger) { // dont go
                    e.target.style.transform = "scale(2)";
                    e.target.style.zIndex = "10";
                    // e.target.innerHTML = "Oops";
                    $scope.matrix[row][col] = $scope.dangerTrodden;
                    $scope.gameActive = false;
                    $scope.gameOver = true;
                    $interval.cancel($scope.promise);
                    // e.target.className = "biohazard";
                } else if ($scope.matrix[row][col] === $scope.safe) { // definitely go
                    e.target.style.transform = "scale(" + scaleFactor + ")";
                    $scope.score++;
                    $scope.matrix[row][col] = $scope.safeTrodden;
                }
            }
        };


        // Define mouse exit rules.
        $scope.onMouseLeave = function (e, row, col) {
            if ($scope.gameActive) {
                e.target.style.transform = "scale(1)";
            }
        };

        // Define mouse exit container rules.
        $scope.onMouseLeaveContainer = function () {
            if ($scope.gameActive) {
                $scope.gameActive = false;
                // $scope.gameOver = true;
                $interval.cancel($scope.promise);
                $scope.gameOverExitContiainer = true;
            }
        };

        let updateScore = function () {
            $scope.timeSoFar += 100;
        };

        $scope.startTimer = function () {
            $scope.promise = $interval(updateScore, 100);
        };


        $scope.setScore = function () {
            $scope.finalScore = $scope.score * 100 - $scope.timeSoFar / 10;
            $scope.maxScore = (localStorage.getItem("maxScore") === null) ? 0 : localStorage.getItem("maxScore");

            if ($scope.maxScore < $scope.finalScore) {
                $scope.newMaxScore = true;
                $scope.maxScore = $scope.finalScore;
                localStorage.setItem("maxScore", $scope.maxScore);
            }
        };


        let generateRandomDirection = function () {
            return dir = Math.floor(Math.random() * 4);
        };

        let validateIndices = function (row, col) {
            if ( row > ($scope.numCells-1) || row < 0 || col > ($scope.numCells-1) || col < 0 ) {
                return false;
            }
            return true;
        };

        let validateDirection = function (row, col) {

            // check boundary
            if ( row > ($scope.numCells-1) || row < 0 || col > ($scope.numCells-1) || col < 0 ) {
                // console.log("false due to boundary check");
                return false;
            }

            // check collision with existing safe path
            if ($scope.matrix[row][col] === $scope.safe || $scope.matrix[row][col] === $scope.safeTrodden) {
                // console.log("false due to collision");
                return false;
            }


            // No more than one adjacent safe box.
            let adjCount = 0;

            // check top box
            if (validateIndices(row-1, col) &&
                ($scope.matrix[row-1][col] === $scope.safe || $scope.matrix[row-1][col] === $scope.safeTrodden)) {
                console.log("Adj top box present");
                adjCount++;
            }

            // check right box
            if (validateIndices(row, col+1) &&
                ($scope.matrix[row][col+1] === $scope.safe || $scope.matrix[row][col+1] === $scope.safeTrodden))  {
                console.log("Adj right box present");
                adjCount++;
            }

            // check bottom box
            if (validateIndices(row+1, col) &&
                ($scope.matrix[row+1][col] === $scope.safe || $scope.matrix[row+1][col] === $scope.safeTrodden) ) {
                console.log("Adj bottom box present");
                adjCount++;
            }

            // check left box
            if (validateIndices(row, col-1) &&
                ($scope.matrix[row][col-1] === $scope.safe || $scope.matrix[row][col-1] === $scope.safeTrodden) ) {
                console.log("Adj left box present");

                adjCount++;
            }

            // console.log("adjCount: " + adjCount );
            return adjCount === 1;


        };

        let convertDirectionToIndices = function (dir, row, col) {
            switch (dir) {
                case 0: // go up
                    row--;
                    break;

                case 1: // go right
                    col++;
                    break;

                case 2: // go down
                    row++;
                    break;

                case 3: // go left
                    col--;
                    break;
            }

            return {
                row: row,
                col: col
            };
        };

        // Initialize safe path.
        let reiterate = true;
        let curPos = {
            row: 0,
            col: 0
        };

        let lastPos = {
            row: 0,
            col: 0
        };

        while (reiterate) {
            // console.log("Reiterating");
            let validDirection = false;
            let exitCount = 8;
            let nextPos;

            do{
                let newDir = generateRandomDirection();
                let row = curPos.row;
                let col = curPos.col;
                nextPos = convertDirectionToIndices(newDir, row, col);
                // console.log("new position: " + nextPos.row + " : " + nextPos.col);
                validDirection = validateDirection(nextPos.row, nextPos.col);
                exitCount--;

                // console.log("exitCount " + exitCount + " validDirection? " + validDirection);
            } while (exitCount > 0 && !validDirection);

            if (validDirection) {
                curPos = nextPos;
                $scope.matrix[curPos.row][curPos.col] = $scope.safe;
                console.log("painting safe at position: " + curPos.row + " : " + curPos.col);
                lastPos = curPos
            } else {
                // just exit the entire thing.
                reiterate = false;
            }

        }

        endRow = lastPos.row;
        endCol = lastPos.col;

        $scope.matrix[endRow][endCol] = $scope.safeTrodden;

    });
