import math

class MinTupleHeap:
    def __init__(self, maxSize = 10):
        self.heap = []
        self.maxSize = maxSize

    def insert(self, newTuple):
        if len(self.heap) >= self.maxSize:
            self.replace(newTuple)
        else:
            self.heap.append(newTuple)

            currentIndex = len(self.heap) - 1
            parentIndex = int(math.floor((currentIndex-1)/2))
            while parentIndex >= 0 and self.heap[parentIndex][0] > self.heap[currentIndex][0]:
                self.heap[currentIndex] = self.heap[parentIndex]
                self.heap[parentIndex] = newTuple

                currentIndex = parentIndex
                parentIndex = int(math.floor((currentIndex-1)/2))
        return

    def replace(self, newTuple):
        self.heap[0] = newTuple

        currentIndex = 0
        leftChildIndex = currentIndex * 2 + 1
        rightChildIndex = currentIndex * 2 + 2
        while leftChildIndex < len(self.heap):
            if rightChildIndex < len(self.heap) and self.heap[rightChildIndex][0] < self.heap[leftChildIndex][0]:
                if self.heap[rightChildIndex][0] < self.heap[currentIndex][0]:
                    self.heap[currentIndex] = self.heap[rightChildIndex]
                    self.heap[rightChildIndex] = newTuple

                    currentIndex = rightChildIndex
                else:
                    break
            else:
                if self.heap[leftChildIndex][0] < self.heap[currentIndex][0]:
                    self.heap[currentIndex] = self.heap[leftChildIndex]
                    self.heap[leftChildIndex] = newTuple

                    currentIndex = leftChildIndex
                else:
                    break

            leftChildIndex = currentIndex * 2 + 1
            rightChildIndex = currentIndex * 2 + 2
        return

    def popSmallest(self):
        popped = self.getSmallest()
        fakeNew = self.heap.pop()
        if len(self.heap) > 0:
            self.replace(fakeNew)
        return popped

    def getSortedArray(self, largestFirst = False):
        sorted = []
        while len(self.heap) > 0:
            sorted.append(self.popSmallest())
        
        self.heap = sorted.copy();

        if largestFirst:
            sorted.reverse()

        return sorted

    def getSmallest(self):
        return self.heap[0]

    def isFull(self):
        return len(self.heap) >= self.maxSize

    




