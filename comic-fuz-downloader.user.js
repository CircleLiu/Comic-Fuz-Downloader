// ==UserScript==
// @name         Comic Fuz Downloader
// @namespace    http://circleliu.cn
// @version      0.1
// @description  Userscript for download comics on Comic Fuz
// @author       Circle
// @match        https://comic-fuz.com/viewer.html*
// @run-at       document-start
// @require      https://unpkg.com/ajax-hook@2.0.3/dist/ajaxhook.min.js
// @require      https://unpkg.com/axios/dist/axios.min.js
// @require      https://unpkg.com/jszip@3.6.0/dist/jszip.min.js
// @require      https://unpkg.com/jszip-utils@0.1.0/dist/jszip-utils.min.js
// @require      https://unpkg.com/jszip@3.6.0/vendor/FileSaver.js
// @require      https://unpkg.com/jquery@3.6.0/dist/jquery.min.js
// @require      https://code.jquery.com/ui/1.12.0/jquery-ui.min.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  const jq3 = $.noConflict()
  jq3(document).ready(($) => {
    const divDownload = $(`
      <div class="menuField" id="showDownloadMenuField" title="Download">
        <button id="showDownload">
          <div></div>
        </button>
      </div>
    `)
    const downloadIcon = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QA/wD/AP+gvaeTAAAA3klEQVRIie3WSw6CMBSF4VtIQPekq2AtbkFxF06cODIx8bEgcRMkvwNbQ9BwL4XohDNiQM9XmrRURAmQAVug4jN3oAQyrUeNL9JSjgF9+5J2HlqPM0BYJuSc6+xKLCVjZIIm6M8QUAB1cydai1obuAaKrpcT4GA4CbQcgVSbWQrsByBnILcuQyx2AWbW5Y7F+iMR2DUa6YENRwzYzYyEEUZs10BOwNza7wKi/bj8oEREViKSi8jaOVdbIBGRXlBMQv9Pz7rKy4uxy4Glf6ys16mh2YQLYsnrMjh23hfMJyUSIBQZYHAQAAAAAElFTkSuQmCC")'
    const loadingIcon = 'url("data:image/gif;base64,R0lGODlhGAAYAPcAAAAAAAEBAQICAgMDAwQEBAUFBQYGBggICAoKCgsLCw0NDQ4ODhAQEBERERISEhMTExMTExQUFBUVFRUVFRYWFhYWFhcXFxcXFxgYGBgYGBgYGBkZGRkZGRoaGhoaGhsbGxwcHBwcHB0dHR4eHh8fHyEhISIiIiQkJCUlJScnJyoqKisrKywsLC0tLS4uLjAwMDIyMjMzMzY2Njk5OTs7Ozw8PD4+Pj8/P0BAQEFBQUJCQkNDQ0REREVFRUZGRkdHR0hISEpKSktLS0tLS0xMTExMTExMTE1NTU1NTU1NTU1NTU1NTU1NTU1NTU5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTlBQUFFRUVJSUlNTU1RUVFZWVldXV1lZWVpaWltbW1xcXFxcXF1dXV5eXl5eXl9fX19fX2FhYWNjY2RkZGZmZmlpaWtra21tbW5ubnBwcHJycnNzc3V1dXd3d3l5eXp6ent7e319fX5+fn9/f4CAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYKCgoKCgoKCgoKCgoKCgoKCgoODg4ODg4SEhISEhIWFhYaGhoeHh4iIiImJiYuLi46Ojo+Pj5KSkpSUlJeXl5mZmZubm52dnZ6enp6enp+fn6CgoKGhoaKioqOjo6Wlpaampqenp6ioqKmpqaqqqqurq6ysrK2tra6urq+vr7CwsLGxsbOzs7S0tLW1tbW1tba2tre3t7i4uLi4uLm5ubq6ury8vL29vb+/v8HBwcPDw8bGxsnJycvLy83Nzc7Ozs/Pz9DQ0NHR0dLS0tPT09TU1NTU1NTU1NXV1dbW1tbW1tfX19fX19jY2NjY2NnZ2dra2tvb293d3d/f3+Dg4OLi4uTk5Obm5unp6erq6uvr6+vr6+zs7Ozs7O3t7e3t7e7u7u/v7+/v7/Dw8PHx8fLy8vT09Pb29vf39/j4+Pn5+fr6+vv7+/z8/P39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgD/ACwAAAAAGAAYAAAI/gD/CRxI8N+1awUTJlRHMFcugu0UEvSWidhAhwO1+VonceApTRz/Yfzn7tewjgOxZeolcKQ0X98kdiNoKxM3kQ/R+VIGcaC5PJmcCQyX6dU/X77+GfPFTqA6bM7gDfwlKI+pmcGSDqSGjeQ2Z9DCFUwHK0+eXRK9OXPWLZ7EbJ9iyczWFKVdhb8S6dVrCSW6coABt8u7N1Hfjn8Dl4t4t/FAZXk2SUxjQ2tColu2kJIoBwCAM9sKsuKyhVK2f5sqEYQj6F8xKQAGNBrobQucYAKt4XjzjwyZf1ImJBPIigWArgKRC7SDo9g/JUr+AZsghuBJvDgmCYQu0M0EWXfPIuzwtj36P24ZbNilhmPUQO4CLU0wZnfme/MCTzsWaMqU3YAAIfkECQoA/wAsAAAAABgAGACHAAAAAQEBAgICAwMDAwMDAwMDBAQEBAQEBQUFBQUFBgYGBwcHBwcHCAgICQkJCgoKDAwMDQ0NDw8PEBAQEhISFRUVFhYWFxcXGBgYGRkZGhoaGxsbHR0dHh4eICAgISEhIyMjJCQkJiYmKCgoKSkpKysrLCwsLS0tLi4uMDAwMTExMjIyNDQ0NTU1Nzc3OTk5Ojo6Ojo6Ozs7Ozs7PDw8PDw8PDw8PT09PT09PT09PT09PT09PT09PT09Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pz8/QEBAQUFBQkJCQ0NDRERERUVFRkZGR0dHSEhISEhISUlJSkpKSkpKS0tLTExMTExMTk5OUFBQUVFRU1NTV1dXWlpaXFxcX19fYWFhY2NjZWVlZ2dnaGhoampqa2trbW1tbm5ubm5ub29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vcHBwcHBwcHBwcHBwcHBwcXFxcXFxcnJycnJyc3NzdHR0dXV1dnZ2d3d3eXl5fHx8fX19f39/gYGBhISEhoaGiYmJi4uLjIyMjY2Njo6Ojo6Oj4+PkJCQkZGRkpKSk5OTlZWVlpaWl5eXmJiYmZmZmpqam5ubnJycnZ2dnp6en5+foaGhoqKio6Ojo6OjpKSkpaWlpqampqamp6enqKioqKioqampqqqqrKysra2tr6+vsLCwsbGxs7OztbW1tra2uLi4ubm5urq6u7u7vLy8vLy8vb29vr6+v7+/wMDAwcHBwsLCw8PDw8PDxMTExcXFxsbGyMjIyMjIycnJysrKysrKy8vLy8vLzMzMzc3Nzs7Oz8/P0NDQ0dHR0tLS09PT1NTU1tbW2NjY2tra3d3d4ODg4uLi4uLi4uLi4+Pj4+Pj5OTk5ubm5+fn6Ojo6enp6urq6+vr6+vr7e3t7e3t7u7u7+/v8fHx8vLy8/Pz8/Pz9PT09fX19vb29/f3+fn5+/v7/Pz8/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////CP4A/wkcSPAfNWoFEyZUR/DUKYLwFBIMZ+jXQIcDrbFiKFFgpUPsBGL8F6+VrY4ZDcES+fCfMlbfJG5raCjbP4zkWA0j2G7guTGIngmk6Onfq1f/erFaJ7Ccsl7yBtYqMwYTt3+3YhFkJu3fO2q9fGkrmC7UmDFIFWbr1evaPInYHpGSeA0aU5R4Fda6w5evIZTasgkWnG5v3zt/OwYenC1d3scEn7lZJLHdunoSxykyYgSTRHjlyvUsGCqJEULY/jFKLBAMIIHsQscbGM6IF4v/rJXo8s+KlX9BAAj9R09dOYLXCJYpgezfjBn/eAH4nfdWCUICnwv0AqBV3isowh9lh/5PGwETeKuV8Dx+ICIAzPBeHah9oE3IAjt1whsQACH5BAkKAP8ALAAAAAAYABgAhwAAAAEBAQICAgMDAwQEBAUFBQYGBgcHBwgICAkJCQoKCgsLCwwMDA4ODg8PDxAQEBERERISEhMTExMTExQUFBUVFRUVFRYWFhYWFhcXFxgYGBkZGRoaGhsbGx0dHR8fHyAgICEhISIiIiMjIyQkJCUlJSYmJicnJygoKCkpKSoqKisrKywsLC4uLi8vLzExMTMzMzQ0NDU1NTY2Njc3Nzg4ODk5OTo6Ojo6Ojs7Ozs7Ozw8PDw8PD09PT09PT09PT4+Pj4+Pj8/Pz8/P0BAQEJCQkNDQ0VFRUdHR0pKSkxMTE5OTlFRUVRUVFdXV1lZWVpaWltbW1xcXF1dXV1dXV5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX2BgYGBgYGFhYWFhYWNjY2RkZGVlZWZmZmhoaGlpaWtra2xsbG5ubnBwcHJycnR0dHd3d3p6ent7e3x8fH19fX5+fn9/f39/f4CAgIGBgYKCgoODg4SEhIaGhoeHh4iIiImJiYqKiouLi4yMjI2NjY+Pj5CQkJGRkZGRkZKSkpOTk5SUlJSUlJWVlZaWlpaWlpeXl5iYmJqampycnJ6enqCgoKGhoaOjo6SkpKWlpaampqenp6enp6ioqKmpqampqaqqqqqqqqysrK2tra+vr7CwsLGxsbKysrOzs7S0tLW1tba2tri4uLm5ubu7u7y8vL6+vr+/v8DAwMHBwcLCwsPDw8TExMTExMXFxcbGxsbGxsfHx8fHx8nJycrKys3Nzc7OztDQ0NHR0dPT09XV1djY2Nvb293d3d7e3t/f3+Hh4eLi4uLi4uPj4+Tk5OTk5OTk5OXl5ebm5ubm5ufn5+fn5+fn5+fn5+jo6Ojo6Onp6enp6erq6uvr6+zs7O7u7vDw8PHx8fLy8vPz8/T09PT09PX19fb29vj4+Pr6+vv7+/z8/P39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/gj+AP8JHEjwnzFjBRMmNEewUiWC6hQSnDan1kCHA5FZIidxYCE66ARi/LcOU6mOA5PNASXy4b9clqBJlDlQ0xxn/zBis0SLYEiB4prcKSaw2hxH/zp1+tfKEsN/1mypcjdwlZMmiaIxDUVQ17B/6YCpWtWsoDlLTZqwVLhMlapj7yQ2A6RJ4jFdHFHqVdiKjF+/dVAmO0gYW9+/ZAJ3HEzYGLa9kAkaI+NHojZpVBVq27NiRSOJ4po10yavoKYWK+iUFXSH4Dqq8aqJfvqv2gomtwQys7Dknw8fYMsNVAetWWmBZQdSseDrX4oU/+SVS0cQnsRYFhQ/F7iuXLy9QTQcWBO4XWC5nx2VWfhMHrrAd8L1SiNYPnLCkR0DAgAh+QQJCgD/ACwAAAAAGAAYAIcAAAAAAAABAQEBAQECAgIDAwMEBAQFBQUGBgYICAgKCgoLCwsMDAwNDQ0ODg4PDw8QEBARERESEhITExMUFBQVFRUWFhYXFxcYGBgZGRkaGhobGxscHBwdHR0eHh4fHx8gICAhISEiIiIjIyMkJCQlJSUmJiYnJycoKCgpKSkqKiorKyssLCwtLS0uLi4vLy8wMDAxMTEyMjI0NDQ3Nzc5OTk7Ozs9PT0/Pz9AQEBDQ0NFRUVGRkZHR0dISEhJSUlKSkpKSkpLS0tLS0tMTExMTExMTExMTExMTExNTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1OTk5OTk5OTk5PT09PT09QUFBQUFBRUVFSUlJTU1NVVVVWVlZZWVlbW1teXl5gYGBiYmJlZWVoaGhpaWlqampra2tsbGxtbW1ubm5vb29vb29wcHBxcXFycnJzc3N0dHR2dnZ3d3d4eHh5eXl6enp7e3t9fX1+fn5/f39/f3+AgICBgYGCgoKCgoKDg4OEhISEhISGhoaIiIiKioqMjIyOjo6Pj4+QkJCRkZGSkpKSkpKTk5OUlJSUlJSVlZWVlZWWlpaWlpaWlpaXl5eXl5eYmJiZmZmZmZmcnJyenp6goKCioqKkpKSlpaWnp6eoqKiqqqqrq6urq6utra2urq6vr6+wsLCwsLCxsbGysrKysrKzs7O1tbW2tra4uLi5ubm6urq7u7u8vLy9vb29vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXHx8fJycnMzMzOzs7Q0NDS0tLU1NTV1dXV1dXW1tbW1tbW1tbX19fX19fX19fY2NjY2NjZ2dnZ2dnZ2dna2trc3Nze3t7f39/g4ODi4uLj4+Pk5OTl5eXn5+fn5+fo6Ojp6enq6urs7Ozt7e3u7u7v7+/w8PDx8fHz8/Pz8/P09PT19fX29vb39/f5+fn7+/v9/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///8I/gD/CRxI8F+vXgUTJhRHcNAggucUEsQGJtVAhwN9/fkmceCcMOUEYvyXLlCljgOHgTn5b2SrP8skTiOYCEyylg+z/SFFcNzAbznM+BKYDcyff4sW/fv0B5xAbKQqqRsYSkeOPdf+idpE0JWtf+VmVbpUrKA4RDlycFU4rFIlXeskGoOjSCKvVd5Q6pVI6olfv2RQ7qJFmDDUv4AFFza8tzFBYFfkyDyGTmI3NxUqBJKIjRcvaPAKLsJQgQyyf3bOEPzGkF0yXr22DdRWAUcsgcYC4PiHrrK2ZaH/kSPG693AYwSvBNj1z5y5f+2WcSMYV2GqAGYEOhf4bdlUvSwKIUxv/vyfvGbY9BYLQGjgdoHllhlHmY3ge4HxHA98N79jQAAh+QQJCgD/ACwAAAAAGAAYAIcAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkKCgoLCwsMDAwNDQ0ODg4PDw8QEBARERESEhITExMUFBQVFRUWFhYXFxcYGBgZGRkaGhobGxscHBwdHR0eHh4fHx8gICAiIiIlJSUnJycpKSkrKystLS0uLi4xMTEzMzM0NDQ1NTU2NjY3Nzc4ODg4ODg5OTk5OTk6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs8PDw8PDw8PDw8PDw9PT09PT09PT0+Pj4+Pj4+Pj4/Pz8/Pz9AQEBBQUFCQkJDQ0NERERGRkZISEhKSkpNTU1QUFBUVFRXV1dYWFhZWVlaWlpbW1tcXFxdXV1eXl5fX19fX19gYGBhYWFiYmJjY2NkZGRmZmZnZ2doaGhpaWlra2tsbGxtbW1tbW1ubm5vb29wcHBwcHBycnJzc3N0dHR2dnZ3d3d4eHh6enp8fHx9fX19fX1+fn5/f39/f3+AgICAgICBgYGBgYGBgYGCgoKCgoKDg4OEhISEhISFhYWGhoaHh4eIiIiKioqLi4uOjo6RkZGUlJSVlZWXl5eYmJiZmZmampqbm5ucnJyenp6fn5+goKChoaGioqKioqKjo6Ojo6OkpKSkpKSlpaWmpqanp6enp6eoqKipqamqqqqrq6utra2vr6+wsLCysrKzs7O1tbW2tra2tra3t7e4uLi5ubm5ubm6urq6urq7u7u7u7u8vLy8vLy9vb2/v7/AwMDBwcHDw8PFxcXGxsbHx8fHx8fIyMjIyMjJycnJycnJycnKysrLy8vLy8vMzMzOzs7Pz8/Pz8/Q0NDQ0NDR0dHT09PU1NTW1tbX19fY2NjZ2dna2tra2trb29vb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pj4+Pk5OTl5eXm5ubn5+fp6enq6urr6+vs7Ozu7u7w8PDz8/P19fX39/f5+fn7+/v9/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7///8I/gD/CRxI8B8tWgUTJkxHME4cgu4UEszGxNNAhwNnqSEncaCYJ+wEYvwHbw2ijgOBMWEk8uE/T2qeSbRGMA8TmRi1qaFEkKHAciWq4BLIjcmbf3z4/HukppzAa5L8wBtI6USJNdf+UXJEUBSrf+pI+REErKC6PCVKcFWIy4+fVvEkJgOjVKGrTOFQ6pWYiYdfv1RQsiJFmHC1vn95BO44uDCpansjE/SFpIzEZr5CKhwnBgCAOhKppUq1bF5BQwMAUJE5T97Eb//iCUulKqtAcABMrBrYLq44cf+i+XL975ytVKYFNiMYr529f99gx/MFeeBUhfXaEY8uEJuvdnvhHoEXyP0fvV/L9rZLDh22wHHDJZN3L5CefIHwrncMCAAh+QQJCgD/ACwAAAAAGAAYAIcAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkKCgoLCwsMDAwNDQ0ODg4QEBATExMVFRUXFxcZGRkbGxscHBweHh4fHx8hISEiIiIjIyMkJCQlJSUmJiYnJycnJycnJycoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkqKioqKiorKysrKyssLCwtLS0uLi4vLy8wMDAyMjIzMzM1NTU2NjY4ODg6Ojo8PDw+Pj5BQUFERERFRUVGRkZHR0dISEhJSUlKSkpLS0tMTExNTU1OTk5OTk5PT09QUFBRUVFSUlJTU1NVVVVWVlZYWFhZWVlaWlpbW1tcXFxcXFxeXl5fX19gYGBhYWFiYmJjY2NkZGRlZWVmZmZoaGhpaWlqampqampra2tra2tsbGxsbGxsbGxtbW1tbW1ubm5vb29vb29wcHBxcXFycnJzc3N1dXV2dnZ4eHh6enp8fHx9fX1+fn5/f3+AgICCgoKEhISGhoaIiIiJiYmLi4uMjIyNjY2Pj4+QkJCRkZGSkpKTk5OUlJSUlJSVlZWWlpaWlpaXl5eXl5eXl5eYmJiYmJiZmZmampqbm5udnZ2enp6goKChoaGioqKjo6OkpKSkpKSlpaWmpqampqanp6epqamqqqqrq6usrKytra2tra2urq6vr6+vr6+xsbGysrKzs7O0tLS1tbW2tra2tra3t7e4uLi4uLi5ubm6urq7u7u9vb2+vr6+vr6/v7/AwMDBwcHCwsLCwsLDw8PExMTFxcXGxsbIyMjJycnJycnKysrLy8vMzMzNzc3Ozs7Pz8/Pz8/Q0NDR0dHR0dHS0tLS0tLU1NTX19fZ2dnb29vc3Nzd3d3f39/g4ODh4eHj4+Pk5OTm5ubn5+fp6enq6urr6+vs7Ozt7e3v7+/x8fHz8/P19fX29vb39/f4+Pj5+fn7+/v8/Pz9/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///8I/gD/CRxI8N+rVwUTJgxH0IsXguUUEsRW49JAhwNVVeEmcWAUHOMEYvx37oqdjgN31eAj8uE/SFWSSZRGsE2NZf8wYqtSiOC3gd4iCJElMFuNh3Hi/PtTxZtAaILSnBuIaEKELtf+IfJD8BKof+EupWlzq2C4OBEiBJL4Kk2aT+kkFntSR6KoRNpQ6pX4qIVfv0JQcnpEmPCyvn9bBO44uPAjnHsjD5Snjp1EYK/EdWRnzlw7icggQeplmWC7zusElgs5sFk1krYgSXJG0Jw6eALfYXMKDdo/YKjUCeRmClJqheGwfV6GsxwqYxAlrsPGmrlAZqgY6uWWTZ5A6//aG6XSpdcdtqnfIf/LFlxvPILgBX6WLFCcZpQBAQAh+QQJCgD/ACwAAAAAGAAYAIcAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkKCgoLCwsMDAwNDQ0ODg4PDw8QEBARERESEhITExMUFBQVFRUWFhYXFxcYGBgZGRkaGhobGxscHBwdHR0eHh4fHx8gICAhISEiIiIjIyMkJCQlJSUmJiYnJycoKCgpKSkqKiorKyssLCwtLS0uLi4vLy8wMDAxMTEyMjIzMzM0NDQ1NTU2NjY3Nzc4ODg5OTk6Ojo7Ozs8PDw9PT0+Pj4+Pj4/Pz9AQEBBQUFDQ0NFRUVGRkZHR0dISEhKSkpLS0tMTExNTU1OTk5PT09QUFBRUVFRUVFSUlJTU1NVVVVVVVVWVlZWVlZXV1dXV1dXV1dYWFhYWFhZWVlaWlpaWlpbW1tcXFxdXV1eXl5gYGBhYWFjY2NlZWVnZ2doaGhpaWlqampra2tsbGxtbW1ubm5vb29wcHBxcXFycnJzc3N1dXV3d3d5eXl7e3t8fHx+fn6AgICCgoKDg4OEhISFhYWGhoaGhoaHh4eIiIiIiIiIiIiJiYmJiYmKioqKioqLi4uMjIyMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKSkpKTk5OTk5OUlJSUlJSVlZWVlZWWlpaXl5eXl5eZmZmbm5udnZ2fn5+hoaGioqKlpaWnp6epqamqqqqqqqqrq6usrKytra2tra2urq6urq6urq6urq6vr6+wsLCwsLCysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy8vLy9vb2+vr6+vr6/v7/AwMDAwMDBwcHCwsLDw8PExMTGxsbKysrNzc3Pz8/S0tLU1NTX19fZ2dna2trb29vc3Nzc3Nzc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojo6Ojp6enp6enq6urs7Ozt7e3v7+/x8fHy8vL09PT19fX29vb39/f4+Pj4+Pj6+vr7+/v9/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///8I/gD/CRxI8N+oUQUTJrxGcMkSgt0UElxWgdFAhwNDBXkmceAPDNsEYvwXbgiZjgNnVXAj8uG/QUGISUxGMEwFY/8wLgtyh+C0gdUAsEAlkFkFJv/EiPn3Jgg0gcjkUAk3kM8AAEyW/dsTh2AiTv+sGaKChSjBbGQAAKAjMRQVKpjKSQT2w4xETnqaodwrkZ25v3/PoWy0p3DhYX4BmxPckbDhPcP4Siao7lpEhbI+WZMIr1uzZlQV6tKjJxa6guWcNdPW7t80jgODIfvnbZSePTIFwms27fQ/dcG0AgP271Vcgc0w6WH8jx3BZsEE48L1jxsmWxAlkgvmTOB0gb4wJv3cm2xY63/f/6XLhBBlumDYBqb/pwzTuL3O5VMf6Hvyv2jR7BUQACH5BAkKAP8ALAAAAAAYABgAhwAAAAEBAQICAgMDAwQEBAUFBQYGBgcHBwgICAkJCQoKCgsLCwwMDA0NDQ4ODg8PDxAQEBERERISEhMTExQUFBUVFRYWFhcXFxgYGBkZGRoaGhsbGxwcHB0dHR4eHh8fHyAgICEhISIiIiMjIyQkJCUlJSYmJicnJygoKCkpKSoqKisrKywsLC0tLS4uLi8vLzAwMDIyMjMzMzQ0NDY2Njg4ODk5OTo6Ojs7Ozs7Ozw8PD09PT09PT4+Pj8/P0BAQEFBQUJCQkJCQkNDQ0NDQ0NDQ0REREREREVFRUZGRkZGRkdHR0hISElJSUpKSkxMTE1NTU9PT1FRUVNTU1RUVFVVVVZWVldXV1hYWFlZWVpaWltbW1xcXF1dXV5eXl9fX2BgYGFhYWJiYmNjY2RkZGVlZWdnZ2lpaWtra25ubnBwcHJycnR0dHV1dXZ2dnd3d3h4eHl5eXl5eXp6ent7e3t7e3t7e3x8fHx8fHx8fH19fX19fX19fX19fX5+fn5+fn5+fn9/f4CAgICAgIGBgYGBgYKCgoKCgoODg4ODg4SEhIWFhYaGhoiIiImJiYuLi46OjpCQkJOTk5aWlpqampycnJycnJ2dnZ2dnZ2dnZ2dnZ6enp6enp6enp+fn5+fn5+fn5+fn5+fn6CgoKCgoKGhoaGhoaKioqOjo6SkpKWlpaampqampqenp6enp6mpqampqaqqqqurq6ysrK2tra6urq6urq+vr7GxsbOzs7a2trq6ur29vb+/v8PDw8TExMbGxsfHx8nJycvLy8zMzM7Ozs7Ozs7Ozs7Ozs/Pz8/Pz8/Pz9DQ0NHR0dLS0tPT09TU1NXV1dbW1tfX19jY2NjY2NnZ2dnZ2dra2tra2tvb29zc3Nzc3Nzc3N3d3d7e3t/f3+Li4uTk5Obm5ufn5+np6ezs7O7u7vHx8fT09Pb29vj4+Pn5+fv7+/z8/Pz8/Pz8/P39/f39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///wj+AP8JHEjwX6ZMBRMm9EYwRw6C4RQSHAYg0UCHAymtgCZxIIsB4ARi/DfOhZSOA2cBCCPy4b86K3ahHBgFQK9/GIWtQEOwGsFy59YJPAagxz8oUP59WSFNoK8wP8YNVFeuHDqBbcgQ/PPoX7Y6P4icSoiuajqJlH78aFROYrtzVxU+UnNspt2E57jp1Ruy4x81gAHvyruXW1+JfwOrkXm38b9zynwqTAXpmsR103r14ibxFho0p84VBKf52dlmwwjikhmO0mddU3sNa/s41k1btv5xCiT13zFFaMwNjCvwV6y2rFj9+xZI+cCICsXFSv0vuUBcgaLZ3SVLnUDr/9AbFZo081yspt+d//PFe+bZgeAFinb879mzmQEBACH5BAkKAP8ALAAAAAAYABgAhwAAAAEBAQICAgMDAwQEBAUFBQYGBgcHBwgICAkJCQoKCgsLCwwMDA0NDQ4ODg8PDxAQEBERERISEhMTExQUFBUVFRYWFhcXFxgYGBkZGRoaGhsbGxwcHB0dHR4eHiEhISMjIyQkJCUlJSYmJicnJygoKCkpKSkpKSoqKioqKisrKysrKywsLCwsLC0tLS4uLi4uLi8vLy8vLzAwMDExMTExMTIyMjMzMzQ0NDU1NTc3Nzg4ODo6Ojw8PD4+Pj8/P0BAQEFBQUJCQkNDQ0REREVFRUZGRkdHR0hISElJSUpKSktLS0xMTE1NTU5OTk9PT1BQUFFRUVJSUlNTU1RUVFVVVVZWVlhYWFpaWl1dXWBgYGJiYmRkZGVlZWdnZ2hoaGhoaGlpaWpqampqamtra2tra2xsbGxsbGxsbGxsbGxsbG1tbW1tbW1tbW1tbW1tbW1tbW1tbW5ubm5ubm9vb29vb3BwcHBwcHFxcXJycnR0dHV1dXd3d3l5eXx8fH5+foKCgoWFhYeHh4mJiYyMjIyMjIyMjI2NjY2NjY2NjY2NjY2NjY2NjY2NjY6Ojo6Ojo+Pj4+Pj5CQkJGRkZGRkZKSkpKSkpOTk5SUlJSUlJSUlJWVlZWVlZWVlZaWlpaWlpeXl5iYmJqampubm5ycnJ6enp+fn6GhoaOjo6Wlpaenp6mpqaurq6ysrK6urrGxsbS0tLa2tre3t7m5ubq6ury8vL29vb+/v7+/v8DAwMHBwcLCwsPDw8TExMTExMXFxcXFxcbGxsbGxsfHx8fHx8fHx8jIyMjIyMjIyMnJycnJycnJycnJycnJycnJycnJycnJycnJycvLy8zMzM3Nzc7Ozs/Pz9DQ0NLS0tTU1NfX19nZ2dra2tvb293d3d7e3t/f3+Hh4eXl5erq6u7u7vHx8fX19fj4+Pj4+Pn5+fr6+vr6+vv7+/v7+/z8/P7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///wj+AP8JHEjwX6ZMBRMqJHjiBEFwCwmOMzew4UBFFaxFFEhuXEWH/8Rh8LFRILpx5QRa/DenAqyFFAeWG7fun0VeFbIQzDYwXTZvKQWOI/fPB0knFbAJpAVlRbiB47RlC3fun7mgAvEA+qcNzQoYoQquE5ctm0eFilas8CMOJri2Cv9oaVaybkJxzfLmrbZxjpa/f13h1duMb0S/gLW4sstYKC5pC0P94anQnDRWrJQqRFWlCqezA7Vh9kVUGC6CqRZ/G1TlSquB5ljNgjuO0+JSpf49GvP0H7E8VUATHRiLU9uD/7aNCTvQ20JvnGwJRP4P1RjDG1V9CkqdHJpAJWsTTxtI/Z8s3iWxGkQItbHAvCUDAgAh+QQJCgD/ACwAAAAAGAAYAIcAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkLCwsNDQ0ODg4QEBARERESEhITExMUFBQUFBQVFRUWFhYWFhYXFxcXFxcYGBgYGBgYGBgZGRkZGRkaGhobGxsbGxscHBwdHR0eHh4fHx8hISEiIiIkJCQmJiYoKCgpKSkqKiorKyssLCwtLS0uLi4vLy8wMDAxMTEyMjIzMzM0NDQ1NTU2NjY3Nzc4ODg5OTk6Ojo7Ozs8PDw9PT0+Pj4/Pz9BQUFDQ0NFRUVHR0dJSUlLS0tMTExNTU1OTk5QUFBRUVFTU1NUVFRUVFRVVVVWVlZWVlZXV1dXV1dXV1dYWFhYWFhZWVlaWlpaWlpbW1tcXFxcXFxdXV1dXV1eXl5eXl5fX19fX19fX19gYGBhYWFhYWFiYmJiYmJjY2NkZGRlZWVmZmZnZ2dpaWlra2ttbW1wcHBzc3N2dnZ6enp8fHx9fX19fX1+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5/f39/f39/f39/f3+AgICAgICBgYGCgoKDg4OEhISFhYWGhoaGhoaHh4eHh4eIiIiIiIiJiYmJiYmJiYmLi4uMjIyNjY2Pj4+RkZGTk5OWlpaYmJiampqcnJydnZ2fn5+hoaGjo6OlpaWoqKipqamrq6usrKytra2vr6+vr6+wsLCxsbGysrKysrKzs7O0tLS0tLS1tbW1tbW1tbW2tra2tra3t7e3t7e3t7e4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5ubm5ubm5ubm6urq7u7u8vLy9vb2+vr7CwsLExMTHx8fJycnMzMzNzc3Ozs7Q0NDR0dHU1NTW1tbY2Nja2trd3d3f39/h4eHk5OTo6Ojq6urq6urr6+vs7Ozs7Ozt7e3u7u7v7+/x8fHy8vLz8/P09PT29vb39/f4+Pj5+fn5+fn6+vr7+/v8/Pz8/Pz9/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///8I/gD/CRxI8N+5cwUTJlxHEBw4gtYUEjw3rdtAhwMPAWgmcaC1aewEYvyHbQCLjgPHTcsm8uG/MgBKSSRHENs0c/8wIgOAhCC0geeQMeMmEN20a//EifvnA8Azga18TEAqEFsyZNLK/dPGcmAaOf+idZmQoVJBdNSQIYuosNCECW+6JhQHjZpEOEiUodwrsRqvv3+RofxypHDhUH4B8xLckbDhI6H4SiaYDRXjhJPgPFVI7limTMskagIC5JG2gs0+07JITBVBTaD+VaMDJEhsgeMyiWKrLZCnf5Ys/QvkhGqyMkDkbiMYKhBSQ4b+SXMSiaBdhdMCpRIIXWAmJ6H3JGYqNI579H/dpMTZmy1QsoHdBZZywrZjOILxBZ6eLDDZe5QBAQAh+QQJCgD/ACwAAAAAGAAYAIcAAAABAQECAgIDAwMDAwMDAwMEBAQEBAQFBQUGBgYGBgYHBwcICAgJCQkKCgoMDAwNDQ0PDw8RERETExMUFBQVFRUWFhYXFxcYGBgZGRkaGhobGxscHBwdHR0eHh4fHx8gICAhISEiIiIjIyMkJCQlJSUmJiYnJycoKCgpKSkqKiorKystLS0vLy8xMTEzMzM1NTU3Nzc4ODg5OTk6Ojo7Ozs8PDw9PT0+Pj4/Pz9AQEBBQUFCQkJCQkJDQ0NDQ0NERERERERFRUVFRUVGRkZGRkZHR0dHR0dISEhISEhJSUlKSkpKSkpLS0tMTExNTU1NTU1OTk5OTk5PT09QUFBRUVFTU1NUVFRVVVVYWFhbW1tdXV1fX19hYWFjY2NlZWVmZmZoaGhpaWlra2tra2tsbGxsbGxsbGxtbW1tbW1tbW1ubm5ubm5ubm5ubm5vb29vb29vb29vb29vb29vb29vb29xcXFzc3N0dHR1dXV2dnZ3d3d4eHh4eHh5eXl5eXl6enp6enp7e3t7e3t7e3t9fX1/f3+BgYGDg4OFhYWHh4eJiYmLi4uNjY2Pj4+SkpKTk5OVlZWWlpaYmJiampqcnJydnZ2enp6fn5+goKChoaGhoaGioqKioqKjo6Ojo6OkpKSkpKSkpKSkpKSlpaWlpaWlpaWmpqampqampqampqampqampqampqampqanp6enp6enp6eoqKipqamqqqqrq6usrKytra2vr6+wsLCysrK1tbW3t7e5ubm6urq8vLy+vr7AwMDBwcHCwsLDw8PFxcXGxsbJycnLy8vMzMzNzc3Pz8/R0dHS0tLT09PU1NTV1dXW1tbY2NjZ2dnb29ve3t7g4ODh4eHj4+Pk5OTm5ubn5+fp6enq6urr6+vs7Ozu7u7w8PDx8fHy8vLy8vLz8/Pz8/Pz8/P09PT09PT09PT19fX29vb39/f4+Pj5+fn7+/v8/Pz+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///8I/gD/CRxI8B84cAUTJmRHkBo1hRD/kQtmbaDDgeu6RRyILFg7gRcFdkO48V+3YNJAPpTYzR1EkgKdBQv37yK8bjQ5DkxHqxc2geaCLftnrWI4jQJtsQBQbWC0WrSK0aSWciC5dP+WSQFAAFHBdcho0WIGMQ8AAF0qKuQWDBnELziAlZyb0Nmqu3dxbYRSo29fS3bxrtIbka/fGpboKhZY7ZIuiIa4HIMYLpchQ74gNlqxYpC2gsIOGVr1GZcogowm/YtmZkUL1QLBGYoETSC2MY7+Xf4nR8dKX1RW/BT4eeCkMdP+2bGTVccggs8gLhvTSeBygYt0CJubyAzJ6/+4G/3oUvLaGF4Dwf/rpKNqRG8E1f8rvrhXr5IBAQAh+QQJCgD/ACwAAAAAGAAYAIcAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkKCgoLCwsMDAwNDQ0ODg4PDw8QEBARERESEhITExMUFBQVFRUWFhYXFxcYGBgaGhocHBweHh4gICAhISEjIyMkJCQlJSUmJiYnJycoKCgpKSkqKioqKiorKyssLCwtLS0tLS0uLi4vLy8vLy8wMDAxMTExMTEyMjIzMzMzMzM0NDQ1NTU2NjY3Nzc4ODg5OTk6Ojo7Ozs8PDw9PT09PT09PT09PT0+Pj4+Pj4/Pz9AQEBBQUFDQ0NFRUVHR0dJSUlLS0tNTU1PT09QUFBSUlJTU1NVVVVWVlZYWFhZWVlaWlpaWlpbW1tcXFxcXFxdXV1eXl5eXl5eXl5eXl5eXl5fX19fX19fX19fX19fX19fX19fX19gYGBhYWFiYmJkZGRmZmZnZ2doaGhpaWlqampqampra2tsbGxsbGxsbGxtbW1tbW1vb29wcHBzc3N1dXV3d3d5eXl7e3t9fX1+fn6AgICCgoKEhISGhoaHh4eJiYmKioqMjIyPj4+Pj4+QkJCQkJCRkZGRkZGRkZGSkpKSkpKSkpKSkpKTk5OTk5OTk5OTk5OTk5OUlJSUlJSUlJSUlJSUlJSUlJSVlZWVlZWVlZWWlpaWlpaXl5eYmJiZmZmbm5udnZ2enp6goKCioqKlpaWnp6epqamrq6utra2vr6+vr6+wsLCxsbGysrKzs7O0tLS2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/BwcHCwsLDw8PFxcXGxsbHx8fJycnKysrLy8vNzc3Pz8/Q0NDR0dHT09PU1NTW1tbZ2dnb29vd3d3e3t7f39/g4ODh4eHi4uLj4+Pj4+Pk5OTl5eXl5eXm5ubn5+fn5+fo6Ojp6enp6enr6+vs7Ozt7e3v7+/v7+/w8PDw8PDx8fHy8vLz8/P19fX39/f5+fn8/Pz9/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///8I/gD/CRxI8J82bQUTJmxH0Jgxgu8UEjTX6tlAhwPHPXMncWCuVgz/Yfz37pm0jgOztTomcCS3Z+okiiM4rNVMjO2eXZOoztOqk//Otfr1T5myf9Q2CnxnbhzBZKE82XLKDBlBbuAEphs3LuTAdb08eSImsR3XdR21wSKqcN25iCjjKjSmqW7dUyh/kNi7VxNdu5rwdtTLl4QmuYgJQjukSuIdJsIklkv15g0siYAqVLCTreAtOW9G7Uw1iqAfQ/+aZamAAbXAcW8CHf03Dcqff3bs/BNzwuI/WkIqUBtYjSAhKM52ixF5Qg7B2QmLQfEkUMzyf3xO6JKLR4pT5QK5HK1oElcaFFcDrQ8cdSI5yqzprwvcmVggrMsoAwIAOwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")'
    $('#menu .submenu:first').append(divDownload)
    $('#showDownload').css('background-image', downloadIcon)
    $('#showDownload').css('background-repeat', 'no-repeat')
    $('#showDownload').css('background-size', 'contain')
    $('#showDownload').click(async function() {
      $('#showDownload').css('background-image', loadingIcon)
      const images = await getAllImages()
      await downloadAsZip(images)
      $('#showDownload').css('background-image', downloadIcon)
    })
  })

  let cid
  let comicTitle
  let contentTitle
  let authInfo
  let baseUrl
  let config

  ah.proxy({
    onResponse: (response, handler) => {
      if (response.config.url.indexOf('license') > -1) {
        handleLicense(response)
      }

      if (response.config.url.indexOf('advertisement/url') > -1) {
        handleAdvertisementUrl(response)
      }

      if (response.config.url.indexOf('configuration_pack.json') > -1) {
        handleConfiguration(response)
      }

      handler.next(response)
    },
  })

  function handleLicense(response) {
    const url = new URL(response.config.url)
    const data = JSON.parse(response.response)
    cid = url.searchParams.get('cid')
    authInfo = data.auth_info
    baseUrl = data.url
  }

  function handleAdvertisementUrl(response) {
    const data = JSON.parse(response.response)
    contentTitle = data.content_title
  }

  function handleConfiguration(response) {
    const data = JSON.parse(response.response)
    config = data
    comicTitle = _findVal(data, 'Title')
  }

  function _findVal(object, key) {
    var value;
    Object.keys(object).some(function(k) {
      if (k === key) {
        value = object[k];
        return true;
      }
      if (object[k] && typeof object[k] === 'object') {
        value = _findVal(object[k], key);
        return value !== undefined;
      }
    });
    return value;
  }

  async function getAllImages() {
    const images = []
    config.configuration.contents.forEach(async ({file}) => {
      for (let i = 0; i < config[file].FileLinkInfo.PageCount; i++) {
        images.push(getImageAndReorgnize(file, i))
      }
    })

    return Promise.all(images)
  }

  async function getImageAndReorgnize(filePath, index) {
    const pagePath = `${filePath}/${index}`
    const srcImage = await getImage(pagePath)
    const image = await reorgnizeImage(srcImage, pagePath)

    return {
      name: `${filePath.slice(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'))}-${index}`,
      data: image
    }
  }

  async function getImage(pagePath) {
    const imageUrl = `${baseUrl}${pagePath}.jpeg`
    const response = await axios.get(imageUrl, {
      params: authInfo,
      responseType: 'arraybuffer',
    })

    return _imageEncode(response.data)
  }

  function reorgnizeImage(image, pagePath) {
    return new Promise((resolve, reject) => {
      const srcCanvas = document.createElement('canvas')
      const srcContext = srcCanvas.getContext('2d')
      const srcImage = new Image()
      srcImage.src = image

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      srcImage.onload = () => {
        const width = srcImage.width
        const height = srcImage.height
        srcCanvas.width = width
        srcCanvas.height = height
        srcContext.drawImage(srcImage, 0, 0)
  
        canvas.width = width
        canvas.height = height
  
        const pattern = Decoder.calcPattern(pagePath)
        const mapData = Decoder.decode(width, height, 64, 64, pattern)
        mapData.forEach(({ srcX, srcY, destX, destY, width, height }) => {
          const srcData = srcContext.getImageData(destX, destY, width, height)
          context.putImageData(srcData, srcX, srcY)
        })

        resolve(canvas.toDataURL('image/jpeg', 1))
        // const images = {}
        // images[`${filePath.slice(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'))}-0`] = canvas.toDataURL('image/jpeg', 1)
      }
      srcImage.onerror = reject
    })
  }

  async function downloadAsZip(images) {
    const zip = new JSZip()
    zip.file('ComicInfo.txt', `${cid}\n${comicTitle}\n${contentTitle}`)
    images.forEach(({name, data}) => {
      zip.file(`${name}.jpg`, data.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), { base64: true })
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${cid}.zip`)
  }

  function _imageEncode(arrayBuffer) {
    let u8 = new Uint8Array(arrayBuffer)
    let b64encoded = btoa([].reduce.call(new Uint8Array(arrayBuffer),function(p,c){return p+String.fromCharCode(c)},''))
    let mimetype="image/jpeg"
    return "data:"+mimetype+";base64,"+b64encoded
  }

  const Decoder = {
    calcPattern: function(str) {
      let n = 0
      str.split('').forEach((char) => {
        n += char.charCodeAt(0)
      })
      return (n % 4) + 1
    },
    decode: function (e, t, r, i, n) {
      var s,a,o,u,c,p,l,m,d,h,y = Math.floor(e / r),g = Math.floor(t / i),f = e % r,b = t % i,S = []
      if (
        ((s = y - ((43 * n) % y)),
        (s = s % y == 0 ? (y - 4) % y : s),
        (s = 0 == s ? y - 1 : s),
        (a = g - ((47 * n) % g)),
        (a = a % g == 0 ? (g - 4) % g : a),
        (a = 0 == a ? g - 1 : a),
        f > 0 &&
          b > 0 &&
          ((o = s * r),
          (u = a * i),
          S.push({
            srcX: o,
            srcY: u,
            destX: o,
            destY: u,
            width: f,
            height: b,
          })),
        b > 0)
      )
        for (l = 0; l < y; l++)
          (d = this.calcXCoordinateXRest_(l, y, n)),
            (h = this.calcYCoordinateXRest_(d, s, a, g, n)),
            (c = this.calcPositionWithRest_(d, s, f, r)),
            (p = h * i),
            (o = this.calcPositionWithRest_(l, s, f, r)),
            (u = a * i),
            S.push({
              srcX: o,
              srcY: u,
              destX: c,
              destY: p,
              width: r,
              height: b,
            })
      if (f > 0)
        for (m = 0; m < g; m++)
          (h = this.calcYCoordinateYRest_(m, g, n)),
            (c = (d = this.calcXCoordinateYRest_(h, s, a, y, n)) * r),
            (p = this.calcPositionWithRest_(h, a, b, i)),
            (o = s * r),
            (u = this.calcPositionWithRest_(m, a, b, i)),
            S.push({
              srcX: o,
              srcY: u,
              destX: c,
              destY: p,
              width: f,
              height: i,
            })
      for (l = 0; l < y; l++)
        for (m = 0; m < g; m++)
          (h = (m + 37 * n + 41 * (d = (l + 29 * n + 31 * m) % y)) % g),
            (c =
              d * r + (d >= this.calcXCoordinateYRest_(h, s, a, y, n) ? f : 0)),
            (p =
              h * i + (h >= this.calcYCoordinateXRest_(d, s, a, g, n) ? b : 0)),
            (o = l * r + (l >= s ? f : 0)),
            (u = m * i + (m >= a ? b : 0)),
            S.push({
              srcX: o,
              srcY: u,
              destX: c,
              destY: p,
              width: r,
              height: i,
            })
      return S
    },
    calcPositionWithRest_: function (e, t, r, i) {
      return e * i + (e >= t ? r : 0)
    },
    calcXCoordinateXRest_: function (e, t, r) {
      return (e + 61 * r) % t
    },
    calcYCoordinateXRest_: function (e, t, r, i, n) {
      var s,
        a,
        o = n % 2 == 1
      return (
        (e < t ? o : !o) ? ((a = r), (s = 0)) : ((a = i - r), (s = r)),
        ((e + 53 * n + 59 * r) % a) + s
      )
    },
    calcXCoordinateYRest_: function (e, t, r, i, n) {
      var s,
        a,
        o = n % 2 == 1
      return (
        (e < r ? o : !o) ? ((a = i - t), (s = t)) : ((a = t), (s = 0)),
        ((e + 67 * n + t + 71) % a) + s
      )
    },
    calcYCoordinateYRest_: function (e, t, r) {
      return (e + 73 * r) % t
    },
  }
})()
